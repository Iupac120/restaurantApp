
import dotenv from 'dotenv';
dotenv.config()
import express from "express"
import Stripe from "stripe";


const stripe = Stripe(process.env.STRIPE_SECRET_KEYS)

//const Stripe = process.env.STRIPE_SECRET_KEYS
import Order from "./OrderModel.js";
import Product from "../product/ProductModel.js"
import { trycatchHandler } from "../../middlewares/trycatchHandler.js";
import BadRequestError from "../../errors/badRequestError.js";
import UnauthorizedError from "../../errors/unAuthorizedError.js";
import { calculateOrderAmount } from "../../util/totalOrderPrice.js";

export class OrderController { 
    static async createMealOrder (req,res) {
        const {body:{
            address,
            paymentMethod},params:{productId}
        } = req
        try{
            const  product  = await Product.findById({_id:productId})
            if(!product && product.length === 0){
                throw new BadRequestError("Product not found")
            }
            const  order  = await Order.findOne({user:req.user.jwtId})
            if(!order || order.length === 0){
                const newOrder = new Order({
                    user: req.user.jwtId,
                    orderItems:[{productId:product._id, quantity: 1}],
                    address,
                    paymentMethod,
                    totalPrice: product.price
                })
                console.log(newOrder)
                const productOrder = await newOrder.save()
                res.status(201).json(productOrder)
            }else{
                const isExisting =  order.orderItems.findIndex(objectId => new String(objectId.productId).trim() == new String(product._id).trim())
                if(isExisting == -1){//if the product does not exist
                    order.orderItems.push({productId:product._id,quantity:1})
                    order.totalPrice += product.price
                }else{
                    const existingProductInCart = order.orderItems[isExisting]
                    if(existingProductInCart.isPaid === true || existingProductInCart.isDelivered === true){
                        throw new UnauthorizedError("This order has been booked already")
                    }
                    existingProductInCart.quantity += 1
                    order.totalPrice  += product.price
                }
                const createOrder = await order.save()
                res.status(201).json(createOrder)
            }
            
        }catch(err){
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
        ).populate("orderItems.productId")
        if(order){
            res.status(201).json(order)
        }else{
            throw new UnauthorizedError("Order not found")
        }
    }catch(err){
        res.status(500).json({message:err.message})
    }
    }

    //user login to get meal orders
    static async loginMealOrder (req,res) {
        try{
        const order = await Order.find({user: req.user.jwtId})/*.sort({_id: -1})*/
        if(order){
            res.status(201).json(order)
        }else{
            throw new UnauthorizedError("Order not found")
        }
    }catch(err){
        res.status(500).json({message:err.message})
    }
    }
    //get preference meal order
    static async preferOrder (req,res) {
        const {isPaid,isDelivered,productLocation} = req.query
        const preferObj = {}
        try {
            if(isPaid){
                preferObj.isPaid = isPaid
            }
            if(isDelivered){
                preferObj.isDelivered = isDelivered
            }
            if(productLocation){
                preferObj.productLocation = [long, lat]
            }
            const orderPrefer = await Order.find(preferObj)
            console.log("one",orderPrefer)
            if(!orderPrefer || orderPrefer.length === 0){
                throw new BadRequestError("You order is empty")
            }
            res.status(200).json(orderPrefer)
        } catch (error) {
            res.status(500).json({message:error.message})
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
   
    //create new food delivery order
    static async createPaymentIntent(req,res) {
        const {body:{paymentOption,orderItems, shippingAddress}} = req
        // //price of food ordered
        // const calculateOrderAmount = (orderItems) =>{
        //     const initialValue = 0;
        //     const itemsPrice = orderItems.reduce((previousValue, currentValue) =>{
        //         previousValue + currentValue.price*currentValue.amount, initialValue
        //     })
        //     return itemsPrice*100;
        // }
        try{
            const {orderId} = req.query
            const order =  await Order.findById({_id:orderId})
            if(!order || order.length === 0){
                throw new UnauthorizedError("No order created for payment")
            }
            stripe.charges.create({
                source: order._id,//req.body.tokenId,
                amount:order.totalPrice,//req.body.amount,
                currency:'usd'
            },(stripeErr,stripeRes) => {
                if(stripeErr){
                    res.status(500).json(stripeErr)
                }else{
                    res.status(200).json(stripeRes)
                }
            }
            )
            //const {orderItems, shippingAddress, userId} = req.body
            // const totalPrice = calculateOrderAmount(orderItems)
            // const taxPrice = 0;
            // const shippingPrice = 0;

            // const order = new Order({
            //     orderItems,
            //     shippingAddress,
            //     paymentMethod:paymentOption,//"stripe",
            //     totalPrice,
            //     taxPrice,
            //     shippingPrice,
            //     user:req.user.jwtId
            // })
            //await order.save()
            // const paymenIntent = await Stripe.paymenIntent.create({
            //     amount: totalPrice,
            //     currency:'usd',
            // })
        //     res.send({
        //         clientSecret: paymenIntent.client_secret
        //     })
        }catch(err){
            res.status(400).json({
                error:{
                    message: err.message
                }
            })
        }
    }    
}