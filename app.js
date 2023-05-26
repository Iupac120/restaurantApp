dotenv.config()
import express from 'express';
import dotenv from 'dotenv';
import cors from "cors";
import cookieParser from "cookie-parser";
import expressLayouts from "express-ejs-layouts";
const app = express()
app.use(express.json())
app.use(express.urlencoded({extended:false}));
app.use(expressLayouts)
app.use(cors());
app.use(cookieParser)

const PORT = process.env.PORT || 5000
import connectDB from "./database/connection.js"
import {router} from "./routes/user.js"
import { errorHandler } from './middlewares/errorHandler.js';
import { notFound } from './middlewares/notFound.js';
app.set("view engine","ejs")
app.use("/api/v1/mealy", router)
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