import Product from "./ProductModel.js";
import { trycatchHandler } from "../../middlewares/trycatchHandler.js";
import BadRequestError from "../../errors/badRequestError.js"
import UnauthorizedError from "../../errors/unAuthorizedError.js";


export default class ProductController{
    //get all products
    static async getAllProduct (req,res) {
        try{
        const product = await Product.find({})
        if(!product){
            throw new BadRequestError("Sorry, we dont have any product")
        }
        res.status(200).json({
            status:"Success",
            data:product
        })
    }catch(err){
        res.status(500).json({message:err.message})
    }
    }

    //get single product
    static async getSingleProduct (req,res){
        const {id} = req.params
        try {
            const product = await Product.find({_id:id})
            if(!product){
                throw new BadRequestError("Sorry, we dont have meal again. Check back later")
            }
            res.status(200).json({
                status:"Success",
                data:product
         })
        } catch (err) {
            res.status(500).json({message:err.message})
        }
    }

    //get product by categories
    static async getProductbyCategories (req,res) {
        try{
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
    }catch(err){
        res.status(500).json({message:err.message})
    }
    }

    //Get all availabe product
    static async AvailableProduct (req,res) {
        try{
        const product = await Product.find({}).select(serviceAvailable === true)
        if(!product){
            throw new BadRequestError("This meal is not available")
        }
        res.status(200).json({
            status:"Success",
            data: product
        })
    }catch(err){
        res.status(500).json({message:err.message})
    }
    }

    //search for a product
    // static searchProduct = trycatchHandler(async(req,res,next) => {
    //     const pageSize = 3;
    //     const page = Number(req.query.pageNumber) || 1
    //     const search = req.query.search?{
    //         name:{
    //             $regex: req.query.search,
    //             $options:'i'
    //         },
    //     }
    //     : {};
    //     const counts = await Product.countDocuments({...search})
    //     const products = await Product.find({...search})
    //     .limit(pageSize)
    //     .skip(page*(page-1))
    //     .sort({_id:-1})
    //     res.status(201).json({
    //         status:"Success",
    //         data: products,page, pages:Math.ceil(counts/pageSize)
    //     })
    // })
    //search for a product
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
    static async discountPrice (req,res){
        try{
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
    }catch(err){
        res.status(500).json({message:err.message})
    }
    }
    //create product
    static async createProduct (req,res) {
        try{
            console.log('one')
        const product = new Product(req.body)
        console.log('one',product)
        const newProduct = await product.save()
        if(!newProduct){
            throw new BadRequestError("No product created")
        }
        res.status(201).json({
            data: newProduct
        })
    }catch(err){
        res.status(500).json({message:err.message})
    }
    }

    //update product
    static async updateProduct (req,res) {
        try{
        const newProduct = await Product.findByIdAndUpdate(req.params.id,{
            $set:req.body
        },{
            new: true,
            runValidators: true
        })
        if(!newProduct){
            throw new BadRequestError("No product created")
        }
        res.status(201).json({
            data: newProduct
        })
    }catch(err){
        res.status(500).json({message:err.message})
    }
    }
    //delete product
  static async deleteProduct (req,res) {
    try{
    const product = await Product.findByIdAndDelete(req.params.id)
    if(!product){
      throw new UnauthorizedError("Product not found")
    }
    res.status(200).json({
      status:"success",
      message:"Product has been deleted"
    })
    }catch(err){
        res.status(500).json({message:err.message})
    }
  }
    //create product review
    static async productReview (req,res) {
        try{
        const {rating, comment} = req.body
        const product = await Product.findById({_id:req.params.id})
        if(product){
            const alreadyReviewed = product.reviews.find(
                (r) => r.user.toString() === req.user._id.toString()
            )
            if(alreadyReviewed){
                throw new UnauthorizedError("Product review already exist")
            }
            const review = {
                name: req.user.name,
                rating: Number(rating),
                comment,
                user: req.user._id
            }
            product.reviews.push(review)
            product.numReview = product.reviews.length
            product.rating = product.reviews.reduce((acc,item) => item.rating + acc, 0)/product.reviews.length
            await product.save()
            res.status(201).json({message:"Review added"})
        }else{
            throw new BadRequestError("Product review failed")
        }
    }catch(err){
        res.status(500).json({message:err.message})
    }
    }
}