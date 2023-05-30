import express from "express";
const router = express.Router()

import ProductController from "./productControllers";
import UserController from "../user/userControllers";

router.get("/products",ProductController.getAllProduct)
router.get("/search",UserController.seachProduct)

router.get("/getProductCategories", UserController.getProductbyCategories)
router.get("/getAvailableProduct", UserController.AvailableProduct)
router.post("/createDiscount", UserController.discountPrice)
router.get("/getProduct/:id", UserController.getSingleProduct)

export {router}