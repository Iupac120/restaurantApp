import express from "express"
const router = express.Router()
import CartController from "./cartControllers.js"
import jwtAuthentication from "../../middlewares/jwtAuthentication.js"
import {verifyTokenAndAdmin} from "../../util/verifyTokenAndAdmin.js"


router.get("/",verifyTokenAndAdmin, CartController.getAllCart)
router.post("/:productId",jwtAuthentication, CartController.addToCart)
router.post("/:productId",jwtAuthentication, CartController.removeFromCart)
router.get("/:productId",jwtAuthentication, CartController.editCart)
router.get("/user",jwtAuthentication, CartController.getCart)
router.get("/delete",jwtAuthentication, CartController.deleteCart)


export {router}