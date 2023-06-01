import Stripe from "stripe";
//const Stripe = process.env.STRIPE_SECRET_KEYS
import Order from "./OrderModel.js";
import { trycatchHandler } from "../../middlewares/trycatchHandler.js";
import BadRequestError from "../../errors/badRequestError.js";
import UnauthorizedError from "../../errors/unAuthorizedError.js";
import { calculateOrderAmount } from "../../util/totalOrderPrice.js";

export class OrderController { 
    static createMealOrder = trycatchHandler(async(req,res,next) => {
        const {
            orderItems,
            shippingAddress,
            paymentMethod,
            taxPrice,
            shippingPrice,
            totalPrice
        } = req.body
        if(orderItems && orderItems.length === 0){
            throw new BadRequestError("No order items")
        }else{
            const order = new Order({
                orderItems,
                shippingAddress,
                paymentMethod,
                taxPrice,
                shippingPrice,
                totalPrice
            })
            const createOrder = await order.save()
            res.status(201).json(createOrder)
        }
    })
    //get a single meal order
    static getMealOrder = trycatchHandler(async(req,res,next) => {
        const {id} = req.params
        const order = await Order.findById({_id: id}).populate(//populate is used to reference a "ref"
            "user", //user is from the user ref in order model
            "name email" //name and email are from the user model
        )
        if(order){
            res.status(201).json(order)
        }else{
            throw new UnauthorizedError("Order not found")
        }
    })

    //login for a meal order
    static loginMealOrder = trycatchHandler(async(req,res,next) => {
        const order = await Order.findById({user: req.user._id}).sort({_id: -1})
        if(order){
            res.status(201).json(order)
        }else{
            throw new UnauthorizedError("Order not found")
        }
    })

    //update meal order
    static updatePaidOrder = trycatchHandler(async(req,res,next) => {
        const {id} = req.params
        const order = await Order.findById({_id: id})
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
    })

    //delete order
  static deleteOrder = trycatchHandler(async (req,res,next) => {
    const order = await Order.findByIdAndDelete(req.params.id)
    if(!order){
      throw new UnauthorizedError("Order not found")
    }
    res.status(200).json({
      status:"success",
      message:"Order has been deleted"
    })
  })
  //get all orders
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