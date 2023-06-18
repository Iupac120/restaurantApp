import express from "express";
const router = express.Router()

        

import ProductController from "./productControllers.js";
import jwtAuthentication from "../../middlewares/jwtAuthentication.js";
import { verifyTokenAndAdmin } from "../../util/verifyTokenAndAdmin.js";


//get product by category
router.get("/category",ProductController.getProductbyCategories)
//get product by favourite
router.get("/favourite",ProductController.favourite)
//count by category
router.get("/countByCategory", ProductController.countByCategory)
//create new product
router.post("/",ProductController.createProduct)
router.post("/:restaurantId",ProductController.createRestaurant)
//get all product
router.get("/",ProductController.getAllProduct)
//search for product
router.get("/search",ProductController.searchProduct)
//get product by categories
router.get("/getProductCategories", ProductController.getProductbyCategories)
router.get("/get_restaurant/:resId/iteId", ProductController.getAllRestaurants)
router.get("/product/eatery/eateryId",ProductController.getByEatery)
//get available product
router.get("/availableProduct", ProductController.AvailableProduct)
//get promotion available
router.get("/promo", ProductController.promo)
//get discount product
router.post("/create_discount", ProductController.discountPrice)
//get product
router.get("/:productId", ProductController.getSingleProduct)
//update product
router.put("/:productId",verifyTokenAndAdmin, ProductController.updateProduct)
//delete product
router.delete("/:productId",verifyTokenAndAdmin, ProductController.deleteProduct)
//create a product review
router.post("/:id/review",jwtAuthentication,ProductController.productReview)
router.post("/uploadImage",ProductController.uploadImage)
export {router}