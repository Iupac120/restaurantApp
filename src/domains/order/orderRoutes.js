import express from "express";
const router = express.Router()
import { OrderController } from "./orderController";
router.post("/webhook", OrderController.payment)
router.post("/create-payment-intent", OrderController.createPaymentIntent)

export {router}