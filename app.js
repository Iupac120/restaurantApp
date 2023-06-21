import * as dotenv from 'dotenv';
dotenv.config()
import express from 'express';
const app = express()
import morgan from 'morgan';
import passport from "passport";
import expressSession from "express-session"
import cors from "cors";
import cookieParser from "cookie-parser";
import cookieSession from "cookie-session"
import { passportCredential } from './src/domains/passport/passport.js.js';
app.use(express.urlencoded({extended:false}));
//app.use(express.static('public'))
app.use(cors());

import connectDB from './src/config/connection.js';
import {router as userRouter} from "./src/domains/user/userRoutes.js"
import {router as productRouter} from "./src/domains/product/productRoutes.js"
import {router as orderRouter} from "./src/domains/order/orderRoutes.js"
import {router as cartRouter} from "./src/domains/cart/cartRoutes.js"
import {router as paymentRouter} from "./src/domains/payment/stripe.js"
import {router as indexRouter} from "./src/domains/passport/index.js"
import { errorHandler } from './src/middlewares/errorHandler.js';
import { notFound } from './src/middlewares/notFound.js';
app.use(express.json())
app.use(morgan('tiny'))
passportCredential(passport)
app.use(expressSession({
    secret:'restaurantApp',
    resave:true,
    saveUninitialized:true,
    //store:new MongoStore({mongooseConnection: mongoose.connection})
}))

// app.use(cookieSession({
//     name:'tuto-session',
//     keys:['key1','key2']
// }))
app.use(passport.initialize())
app.use(passport.session())

//API
app.use(cookieParser())
app.use('/api/v1/user',userRouter)
app.use("/api/v1/product",productRouter)
app.use("/api/v1/order",orderRouter)
app.use("/api/v1/cart",cartRouter)
app.use("/api/v1/checkout",paymentRouter)
app.use("/",indexRouter)
//view engine
app.set('view engine', 'ejs')
// app.get("/",(req,res) => {
//     res.render("pages/index")
// })
// app.get("/",(req,res) => {
//     res.send(req.user?req.user:`not logged in, login withfacebbok or google`)
// })

const PORT = process.env.PORT || 5000

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