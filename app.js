import dotenv from 'dotenv';
dotenv.config()
import express from 'express';
const app = express()
import morgan from 'morgan';
import cors from "cors";
import cookieParser from "cookie-parser";
app.use(express.urlencoded({extended:false}));
app.use(express.static('public'))
app.use(cors());

import connectDB from './src/config/connection.js';
import {router as userRouter} from "./src/domains/user/userRoutes.js"
import {router as productRouter} from "./src/domains/product/productRoutes.js"
import {router as orderRouter} from "./src/domains/order/orderRoutes.js"
import {router as cartRouter} from "./src/domains/cart/cartRoutes.js"
import {router as paymentRouter} from "./src/domains/payment/stripe.js"
import { errorHandler } from './src/middlewares/errorHandler.js';
import { notFound } from './src/middlewares/notFound.js';
app.use(express.json())
app.use(morgan('tiny'))


//API
app.use('/api/v1/user',userRouter)
app.use("/api/v1/product",productRouter)
app.use("/api/v1/order",orderRouter)
app.use("/api/v1/cart",cartRouter)
app.use("/api/v1/checkout",paymentRouter)
//view engine
app.set('view engine', 'ejs')




const PORT = process.env.PORT || 5000


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