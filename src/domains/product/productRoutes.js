import express from "express";
const router = express.Router()

import ProductController from "./productControllers";

router.get("/products",ProductController.getAllProduct)

export {router}