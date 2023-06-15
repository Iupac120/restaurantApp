import express from "express"
const router = express.Router()
import CartController from "./cartControllers.js"
import jwtAuthentication from "../../middlewares/jwtAuthentication.js"
import {verifyTokenAndAdmin} from "../../util/verifyTokenAndAdmin.js"


router.get("/",verifyTokenAndAdmin, CartController.getAllCart)
router.post("/:productId",jwtAuthentication, CartController.addToCart)
router.put("/:cartId",jwtAuthentication, CartController.updateCart)
router.get("/:userId",jwtAuthentication, CartController.getCart)
router.delete("/:cartId",jwtAuthentication, CartController.deleteCart)


export {router}