import express from "express";
const router = express.Router()
import { OrderController } from "./orderController.js";
import jwtAuthentication from "../../middlewares/jwtAuthentication.js";
import { verifyTokenAndAdmin } from "../../util/verifyTokenAndAdmin.js";

// get all order
router.get("/",verifyTokenAndAdmin, OrderController.createMealOrder)
//create orders
router.post("/", jwtAuthentication, OrderController.createMealOrder)
//get user meal order
router.get("/:userId", jwtAuthentication, OrderController.loginMealOrder)
//get order
router.get("/order/:id",jwtAuthentication,OrderController.getMealOrder)
//delete order
router.delete("/order/:id",jwtAuthentication,OrderController.deleteOrder)
//update payment order
router.put("/order/:id/pay",jwtAuthentication,OrderController.updatePaidOrder)
//make payment
//router.post("/webhook", OrderController.payment)
//make payment intent
router.post("/create-payment-intent", OrderController.createPaymentIntent)

export {router}