import Stripe from "stripe";
//const Stripe = process.env.STRIPE_SECRET_KEYS
import Order from "./OrderModel.js";
import Product from "../product/ProductModel.js"
import { trycatchHandler } from "../../middlewares/trycatchHandler.js";
import BadRequestError from "../../errors/badRequestError.js";
import UnauthorizedError from "../../errors/unAuthorizedError.js";
import { calculateOrderAmount } from "../../util/totalOrderPrice.js";

export class OrderController { 
    static async createMealOrder (req,res) {
        console.log("one",req.user)
        const {
            orderItems,
            address,
            paymentMethod,
            totalPrice
        } = req.body
        try{
        if(orderItems && orderItems.length === 0){
            throw new BadRequestError("No order items")
        }else{
            const order = new Order({
                user:req.user.jwtId,
                orderItems,
                address,
                paymentMethod,
                totalPrice
            })
            const createOrder = await order.save()
            res.status(201).json(createOrder)
        }
    }catch(err){
        console.log(err)
        res.status(500).json({message:err.message})
    }
    }
    //get a single meal order by Id
    static async getMealOrder (req,res) {
        const {orderId} = req.params
    try{
        const order = await Order.findById({_id: orderId}).populate(//populate is used to reference a "ref"
            "user", //user is from the user ref in order model
            "username email" //name and email are from the user model
        ).populate({
            path:"orderItems",
            select:"eatery",
            populate:{
                path:"eatery",
                select:"restaurant"
            }   
        })
        console.log("one",order)
        if(order){
            res.status(201).json(order)
        }else{
            throw new UnauthorizedError("Order not found")
        }
    }catch(err){
        console.log(err)
        res.status(500).json({message:err.message})
    }
    }

    //user login to get meal orders
    static async loginMealOrder (req,res) {
        try{
            console.log("one",req.user)
        const order = await Order.find({user: req.user.jwtId})/*.sort({_id: -1})*/
        if(order){
            res.status(201).json(order)
        }else{
            throw new UnauthorizedError("Order not found")
        }
    }catch(err){
        console.log(err)
        res.status(500).json({message:err.message})
    }
    }

    //update meal order
    static async updatePaidOrder (req,res)  {
        const {orderId} = req.params
        try{
        const order = await Order.findById({_id: orderId})
        if(order){
            order.isPaid = true,
            order.paidAt = Date.now(),
            order.paymentResult={
                id:req.body.id,
                status:req.body.status,
                update_time:req.body.update_time,
                email_address:req.body.email_address,
            }
            const updatedOrder = await order.save()
            res.status(201).json(updatedOrder)
        }else{
            throw new UnauthorizedError("Order not found")
        }
    }catch(err){
        console.log(err)
        res.status(500).json({message:err.message})
    }
    }

     //update order
  static async updateOrder (req,res) {
    try{
    const order = await Order.findByIdAndUpdate({_id:req.params.orderId},{$set:req.body},{
        new: true,
        runValidators: true
    })
    if(!order){
      throw new UnauthorizedError("Order not found")
    }
    res.status(200).json({
      status:"success",
      message:"Order has been updated"
    })
    }catch(err){
        console.log(err)
        res.status(500).json({message:err.message})
    }
  }

    //delete order
  static async deleteOrder (req,res) {
    try{
    const order = await Order.findByIdAndDelete(req.params.orderId)
    if(!order){
      throw new UnauthorizedError("Order not found")
    }
    res.status(200).json({
      status:"success",
      message:"Order has been deleted"
    })
    }catch(err){
        console.log(err)
        res.status(500).json({message:err.message})
    }
  }
  //get all orders by Admin
  static getAllOrder = trycatchHandler(async (req,res) => {
    const orders =  await Order.find({})
    if(!orders){
        throw new BadRequestError("Order is not available")
    }
    res.status(201).json({
        data: orders
    })
  })
    //make payment for meal order
    // static async payment (req,res) {
    //     let data, eventType;
    //     //check if the webhook is configured
    //     if(process.env.STRIPE_WEBHOOK_KEYS){
    //         //retrieve the event by verifying the signatures the raw body and webhook secreet
    //         let event;
    //         let signature = req.headers['stripe-signature'];
    //         try{
    //             event = Stripe.webhooks.constructEvent(
    //                 req.rawBody,
    //                 signature,
    //                 process.env.STRIPE_WEBHOOK_KEYS
    //             )
    //         }catch(err){
    //             console.log(err)
    //             return res.status(400).json({
    //                 status:"Failed"
    //             })
    //         }
    //         data = event.data;
    //         eventType = event.type
    //     }else{
    //         // we can retieve the event data direct from the request body
    //         data = req.body.data;
    //         eventType = req.body.type
    //     }
    //     if(eventType === 'payment_intent.succeded'){
    //         // funct has been captured and payment made
    //         //fulfill event order, email, receipt
    //     }else if(eventType === 'payment_intent.payent_failed'){
    //         console.log('payment failed')
    //     }
    //     res.status(200)
    // }

    //create new food delivery order
    static async createPaymentIntent(req,res) {
        const {body:{paymentOption,orderItems, shippingAddress},user:{_id:userId}} = req
        // //price of food ordered
        // const calculateOrderAmount = (orderItems) =>{
        //     const initialValue = 0;
        //     const itemsPrice = orderItems.reduce((previousValue, currentValue) =>{
        //         previousValue + currentValue.price*currentValue.amount, initialValue
        //     })
        //     return itemsPrice*100;
        // }
        try{
            //const {orderItems, shippingAddress, userId} = req.body
            const totalPrice = calculateOrderAmount(orderItems)
            const taxPrice = 0;
            const shippingPrice = 0;

            const order = new Order({
                orderItems,
                shippingAddress,
                paymentMethod:paymentOption,//"stripe",
                totalPrice,
                taxPrice,
                shippingPrice,
                user:userId
            })
            await order.save()
            const paymenIntent = await Stripe.paymenIntent.create({
                amount: totalPrice,
                currency:'usd',
            })
            res.send({
                clientSecret: paymenIntent.client_secret
            })
        }catch(err){
            res.status(400).json({
                error:{
                    message: err.message
                }
            })
        }
    }    



}