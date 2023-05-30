dotenv.config()
import express from 'express';
import dotenv from 'dotenv';
import cors from "cors";
import cookieParser from "cookie-parser";
import expressLayouts from "express-ejs-layouts";
const app = express()
//app.use(express.json())
app.use(express.json({
    //we need the raw body to verify the webhook signature
    verify: function(req,res, buf){
        if(req.originalUrl.startsWith('/webhook')){
            req.rawBody = buf.toString()
        }
    }
}))

app.use(express.urlencoded({extended:false}));
app.use(expressLayouts)
app.use(cors());
app.use(cookieParser)

const PORT = process.env.PORT || 5000
import connectDB from './src/config/connection.js';
import {router as userRouter} from "./src/domains/user/userRoutes.js"
import { errorHandler } from './src/middlewares/errorHandler.js';
import { notFound } from './src/middlewares/notFound.js';

app.use("/api/v1/mealy",userRouter)
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