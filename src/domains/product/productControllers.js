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
        const {productId} = req.params
        try {
            const product = await Product.find({_id:productId})
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

    // //get product by categories
    // static async getProductbyCategories (req,res) {
    //     try{
    //     const product = await Product.aggregate([
    //         {$match: {}},
    //         {$group: {
    //             _id: '$category', //
    //             products: {$push: '$$ROOT'}
    //         }},
    //         {$project: {name: $_id, products: 1, _id: 0}}
    //     ])
    //     res.status(200).json({
    //         status:"Sucess",
    //         data:product
    //     })
    // }catch(err){
    //     res.status(500).json({message:err.message})
    // }
    // }

       //get product by categories
       static async getProductbyCategories (req,res) {
        try{
        const product = await Product.getFoodByCategory()
        console.log(product)
        if(!product || product.length === 0) throw new UnauthorizedError("No category found")
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
        const product = await Product.find({})
        const newPro = product.find((prod) =>{
            return prod.featured === true
        })
        if(!product){
            throw new BadRequestError("This meal is not available")
        }
        res.status(200).json({
            status:"Success",
            data: newPro
        })
    }catch(err){
        res.status(500).json({message:err.message})
    }
    }
    
    //select promotion offer
        static async promo (req,res) {
            try{
            const product = await Product.find({})
            if(!product){
                throw new BadRequestError("This meal is not available")
            }
            const newPro = product.filter((prod) =>{
                return prod.promoAvailable === true
            })
            if(!newPro || newPro.length === 0){
                throw new BadRequestError("We don't have promotion for now")
            }
            res.status(200).json({
                status:"Success",
                data: newPro
            })
        }catch(err){
            res.status(500).json({message:err.message})
        }
        }

    //search for a product
    // static async searchProduct (req,res) {
    //     try{
    //     const pageSize = 3;
    //     const page = Number(req.query.pageNumber) || 1
    //     const search = req.query.name?{
    //         name:{
    //             $regex: req.query.name.restaurant,
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
    // }catch(err){
    //     res.status(500).json(err.message)
    // }
    // }

    //search for a product
    static async  searchProduct (req,res){
        try {
            const {restaurant, food, drink} = req.query
            const queryObject = {}
            // if (promoAvailable){
            //     queryObject.promoAvailable = promoAvailable === 'true'? true: false
            // }
            // if(category){
            //     queryObject.category = category
            // }
            if(restaurant){
                queryObject['name.restaurant'] = {$regex: restaurant, $options: 'i'}
            }
            if(food){
                queryObject['name.food.name'] = {$regex: food, $options: 'i'}
            }
            if(drink){
                queryObject['name.drink.name'] = {$regex: drink, $options: 'i'}
            }
            // if(discount){
            //     queryObject.discount = discount
            // }
            const product = await Product.find(queryObject)
            if(!product || product.length === 0){
                throw new BadRequestError("Product not found")
            }
            res.status(200).json({
                status:"Success",
                data:product
            })
        } catch (err) {
            res.status(500).json({msg:err.message})
        }
    }

    //calculate discount
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
            console.log("one")
        const newProduct = await Product.findByIdAndUpdate(req.params.productId,{
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
    static async favourite(req,res){
        try{
            const product = await Product.find({rating:{$gt:3.5}}).limit(5).sort({rating:-1})
            if(!product || product.length === 0){
                const product = await Product.find({rating:{$gt:3}}).limit(5).sort({rating:-1})
                res.status(201).json({product})
            }
            res.status(201).json({product})
        }catch(err){
            res.status(500).json({messge:err.message})
        }
    }
    // static async countByCategory (req,res){
    //     try{
    //         const count = req.query.countCat.split(",")
    //         const list = await Promise.all(count.map((cat) =>{
    //             return Product.countDocuments({["name[food.category]"]:cat})
    //         }))
    //         res.status(201).json(list)

    //     }catch(err){
    //         res.status(201).json({message:err.message})
    //     }
    // }
    static async countByCategory(req, res) {
        try {
          const count = req.query.countCat.split(",");
          const list = await Promise.all(count.map(async (cat) => {
            return await Product.countDocuments({ "name.food.category": cat });
          }));
          res.status(201).json(list);
        } catch (err) {
          res.status(201).json({ message: err.message });
        }
      }
      
}