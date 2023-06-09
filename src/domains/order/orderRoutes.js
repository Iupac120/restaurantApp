import express from "express";
const router = express.Router()
import { OrderController } from "./orderController.js";
import jwtAuthentication from "../../middlewares/jwtAuthentication.js";
import { verifyTokenAndAdmin } from "../../util/verifyTokenAndAdmin.js";

// get all order
router.get("/meal_orders",verifyTokenAndAdmin, OrderController.getAllOrder)
//create orders
router.post("/:productId", jwtAuthentication, OrderController.createMealOrder)
//get user meal order
router.get("/", jwtAuthentication, OrderController.loginMealOrder)
//get prefer order
router.get("/prefer",jwtAuthentication, OrderController.preferOrder)
//get order
router.get("/:orderId",jwtAuthentication,OrderController.getMealOrder)
//updte order
router.put("/:orderId",jwtAuthentication,OrderController.updateOrder)
//delete order
router.delete("/:orderId",jwtAuthentication,OrderController.deleteOrder)
//update payment order
router.put("/:orderId/pay",jwtAuthentication,OrderController.updatePaidOrder)
//make payment
//router.post("/webhook", OrderController.payment)
//make payment intent
router.post("/create-payment-intent", OrderController.createPaymentIntent)

export {router}