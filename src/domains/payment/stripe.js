import dotenv from 'dotenv';
dotenv.config()
import express from "express"
const router = express.Router()
import Stripe from "stripe";


const stripe = Stripe(process.env.STRIPE_SECRET_KEYS)

router.post("/payment",(req,res) =>{
        stripe.charges.create({
            source: req.body.tokenId,
            amount:req.body.amount,
            currency:'usd'
        },(stripeErr,stripeRes) => {
            if(stripeErr){
                res.status(500).json(stripeErr)
            }else{
                res.status(200).json(stripeRes)
            }
        })
    }
)

//router.post('/create-checkout-session',async(req,res) =>{
//     session = await Stripe.Checkout.Session.create({
//         line_items: [{
//           price_data: {
//             currency: 'usd',
//             product_data: {
//               name: 'T-shirt',
//             },
//             unit_amount: 2000,
//           },
//           quantity: 1,
//         }],
//         mode: 'payment',
//         //These placeholder URLs will be replaced in a following step.
//         success_url: `${process.env.CLIENT_URL}/checkout-success`,//'https://example.com/success',
//         cancel_url: `${process.env.CLIENT_URL}/cart`//'https://example.com/cancel',
//       })

//       res.send ({url:session.url})
      
//})

 export {router}