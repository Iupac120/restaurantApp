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
    static getSingleProduct = trycatchHandler(async(req,res) =>{
        const {id} = req.params
        const product = await Product.find({_id:id})
        if(!product){
            throw new BadRequestError("Sorry, we dont have meal again. Check back later")
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
    static AvailableProduct = trycatchHandler(async(req,res,next) => {
        const product = await Product.find({}).select(serviceAvailable === true)
        if(!product){
            throw new BadRequestError("This meal is not available")
        }
        res.status(200).json({
            status:"Success",
            data: product
        })
    })
    static async  searchProduct (req,res){
        try {
            const {promoAvailable, category, name, discount} = req.query
            const queryObject = {}
            if (promoAvailable){
                queryObject.promoAvailable = promoAvailable === 'true'? true: false
            }
            if(category){
                queryObject.category = category
            }
            if(name){
                queryObject.name = {$regex: name, $options: 'i'}
            }
            if(discount){
                queryObject.discount = discount
            }
            const product = await Product.find(queryObject)
            if(!product){
                throw new BadRequestError("Product not found")
            }
            res.status(200).json({
                status:"Success",
                data:product
            })
        } catch (err) {
            res.status(401).json({msg:"Failed to get product"})
        }
    }
    static discountPrice = trycatchHandler(async(req,res,net) => {
        const {discount, originalPrice} = req.body
        const discountPercent = discount/100
        const totalPrice = originalPrice - (originalPrice*discountPercent)
        const price = await Product.create({
            discount: discountPercent,
            price: totalPrice
        })
        if(!price){
            throw new BadRequestError("The meal does not have discount")
        }
        return res.status(200).json({
            status:"Success",
            data:price
        })
    }) 
}