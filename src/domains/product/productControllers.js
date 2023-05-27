import Product from "./ProductModel";
import { trycatchHandler } from "../../../middlewares/trycatchHandler";
import BadRequestError from "../../../errors/badRequestError";


export default class ProductController{
    static getAllProduct = trycatchHandler(async(req,res) =>{
        const product = await Product.find({})
        if(!product){
            throw new BadRequestError("Sorry, we dont have any product")
        }
        res.status(200).json({
            status:"Success",
            data:product
        })
    })
    static getProductbyCategories = trycatchHandler(async(req,res) => {
        const product = await Product.aggregate([
            {$match: {}},
            {$group: {
                _id: '$category', //
                products: {$push: '$$ROOT'}
            }},
            {$project: {name: $_id, products: 1, _id: 0}}
        ])
        res.status(200).json({
            status:"Sucess",
            data:product
        })
    })
}