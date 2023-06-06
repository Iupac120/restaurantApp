import express from "express";
const router = express.Router()

import ProductController from "./productControllers.js";
import jwtAuthentication from "../../middlewares/jwtAuthentication.js";
import { verifyTokenAndAdmin } from "../../util/verifyTokenAndAdmin.js";
//get all product
router.get("/",ProductController.getAllProduct)
//search for product
router.get("/search",ProductController.searchProduct)
//get product by categories
router.get("/getProductCategories", ProductController.getProductbyCategories)
//get available product
router.get("/availableProduct", ProductController.AvailableProduct)
//get discount product
router.post("/createDiscount", ProductController.discountPrice)
//get product
router.get("/:id", ProductController.getSingleProduct)
//update product
router.put("/product/:id",verifyTokenAndAdmin, ProductController.updateProduct)
//delete product
router.delete("/product/:id",verifyTokenAndAdmin, ProductController.updateProduct)
//create new product
router.post("/",ProductController.createProduct)
//create a product review
router.post("/:id/review",jwtAuthentication,ProductController.productReview)

export {router}