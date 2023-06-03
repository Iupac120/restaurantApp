dotenv.config()
import express from 'express';
const app = express()
import morgan from 'morgan';
import dotenv from 'dotenv';
import cors from "cors";
import cookieParser from "cookie-parser";
app.use(express.urlencoded({extended:false}));
app.use(cors());

import connectDB from './src/config/connection.js';
import {router as userRouter} from "./src/domains/user/userRoutes.js"
import {router as productRouter} from "./src/domains/product/productRoutes.js"
import {router as orderRouter} from "./src/domains/order/orderRoutes.js"
import {router as cartRouter} from "./src/domains/cart/cartRoutes.js"
import { errorHandler } from './src/middlewares/errorHandler.js';
import { notFound } from './src/middlewares/notFound.js';
app.use(express.json())
app.use(morgan('tiny'))
// app.use(express.json({
//     //we need the raw body to verify the webhook signature
//     verify: function(req,res, buf){
//         if(req.originalUrl.startsWith('/webhook')){
//             req.rawBody = buf.toString()
//         }
//     }
// }))

//API
app.use('/api/v1/user',userRouter)
app.use("/api/v1/product",productRouter)
app.use("/api/v1/order",orderRouter)
app.use("/api/v1/cart",cartRouter)
app.post("/api/v1/body",(req,res) => {
    console.log("body")
    res.status(200).json({
        data:req.body
    })
})




const PORT = process.env.PORT || 3000


app.use(cookieParser)
const start = async() => {
    try {
        await connectDB(process.env.MONGODB_CONNECTION_URL)
        await console.log("Connected to database")
        app.listen(PORT, () => {console.log(`server is listening at port ${PORT}`)})
    } catch (err) {
        console.log(err)
    }
}


//error middlewares

app.use(notFound)
app.use(errorHandler)
start()