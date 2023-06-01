// import express from "express"
// const router = express.Router()
// import Stripe from "stripe";
// const Stripe = process.env.STRIPE_SECRET_KEYS

// export default class Payment {
//     static Payment = (req,res) =>{
//         Stripe.charges.create({
//             source: req.body.tokenId,
//             amount:req.body.amount,
//             currency:'usd'
//         },(stripeErr,stripeRes) => {
//             if(stripeErr){
//                 res.status(500).json(stripeErr)
//             }else{
//                 res.status(200).json(stripeRes)
//             }
//         })
//     }
// }

// export {router}