import Stripe from "stripe";
const Stripe = process.env.STRIPE_SECRET_KEYS
import Order from "./OrderModel";
export class OrderController { 
    static async payment (req,res) {
        let data, eventType;
        //check if the webhook is configured
        if(process.env.STRIPE_WEBHOOK_KEYS){
            //retrieve the event by verifying the signatures the raw body and webhook secreet
            let event;
            let signature = req.headers['stripe-signature'];
            try{
                event = Stripe.webhooks.constructEvent(
                    req.rawBody,
                    signature,
                    process.env.STRIPE_WEBHOOK_KEYS
                )
            }catch(err){
                console.log(err)
                return res.status(400).json({
                    status:"Failed"
                })
            }
            data = event.data;
            eventType = event.type
        }else{
            // we can retieve the event data direct from the request body
            data = req.body.data;
            eventType = req.body.type
        }
        if(eventType === 'payment_intent.succeded'){
            // funct has been captured and payment made
            //fulfill event order, email, receipt
        }else if(eventType === 'payment_intent.payent_failed'){
            console.log('payment failed')
        }
        res.status(200)
    }

    //create new food delivery order
    static async createPaymentIntent(req,res) {
        //price of food ordered
        const calculateOrderAmount = (orderItems) =>{
            const initialValue = 0;
            const itemsPrice = orderItems.reduce((previousValue, currentValue) =>{
                previousValue + currentValue.price*currentValue.amount, initialValue
            })
            return itemsPrice*100;
        }
        try{
            const {orderItems, shippingAddress, userId} = req.body
            const totalPrice = calculateOrderAmount(orderItems)
            const taxPrice = 0;
            const shippingPrice = 0;

            const order = new Order({
                orderItems,
                shippingAddress,
                paymentMethod:"stripe",
                totalPrice,
                taxPrice,
                shippingPrice,
                user:''
            })
            await order.save()
            const paymenIntent = await Stripe.paymenIntent.create({
                amount: totalPrice,
                currency:'Naira',
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