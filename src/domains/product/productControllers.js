import Product from "./ProductModel.js";
import Restaurant from "./RestaurantModel.js";
import { trycatchHandler } from "../../middlewares/trycatchHandler.js";
import BadRequestError from "../../errors/badRequestError.js"
import UnauthorizedError from "../../errors/unAuthorizedError.js";


export default class ProductController{
    //get all products
    static async getAllProduct (req,res) {
        try{
            const page = 1
            const limit = 5
            const skip = (page - 1)*limit
        const counts = await Product.countDocuments()
        const product = await Product.find({}).limit(limit).skip(skip).sort({"name":1})
        if(!product){
            throw new BadRequestError("Sorry, we dont have any product")
        }
        res.status(200).json({
            status:"Success",
            data:product,
            count: Math.ceil(counts/limit)
        })
        
    }catch(err){
        res.status(500).json({message:err.message})
    }
    }

    //get single product
    static async getSingleProduct (req,res){
        const {productId} = req.params
        try {
            const product = await Product.findById({_id:productId})
            if(!product || product.length === 0){
                throw new BadRequestError("Sorry, we dont have the meal again. Check back later")
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
            const categories = req.query.categories.split(",")
            console.log(categories)
            const category = await Promise.all(categories.map(cat => {
                return Product.countDocuments({category:cat})
            }))
        if(!category || category.length === 0) throw new UnauthorizedError("No category found")
        res.status(200).json({
            status:"Sucess",
            data:category
        })
    }catch(err){
        res.status(500).json({message:err.message})
    }
    }


    //Get all availabe product
    static async AvailableProduct (req,res) {
        try{
            const page = 1
            const limit = 5
            const skip = (page - 1)*limit
            const counts = await Product.countDocuments()
            const {featured} = req.query
            if(featured){
                const product = await Product.find({featured: true}).limit(limit).skip(skip).sort({"name":1})
                res.status(200).json({
                    message:"Success",
                    data: product,
                    count: Math.ceil(counts/limit)
                })
            }else{
                const product = await Product.find({featured: false}).limit(limit).skip(skip).sort({"name":1})
                res.status(200).json({
                    status:"Success",
                    data: product,
                    count:Math.ceil(counts/limit)
                })
            }
    }catch(err){
        res.status(500).json({message:err.message})
    }
    }
    
    //select promotion offer
        static async promo (req,res) {
        //     try{
        //     const product = await Product.find({})
        //     if(!product){
        //         throw new BadRequestError("This meal is not available")
        //     }
        //     const newPro = product.filter((prod) =>{
        //         return prod.promoAvailable === true
        //     })
        //     if(!newPro || newPro.length === 0){
        //         throw new BadRequestError("We don't have promotion for now")
        //     }
        //     res.status(200).json({
        //         status:"Success",
        //         data: newPro
        //     })
        // }catch(err){
        //     res.status(500).json({message:err.message})
        // }
        try{
            const page = 1
            const limit = 5
            const skip = (page - 1)*limit
            const counts = await Product.countDocuments()
            const {promo} = req.query
            if(promo){
                const product = await Product.find({promoAvailable: true}).limit(limit).skip(skip).sort({"name":1})
                res.status(200).json({
                    message:"Success",
                    data: product,
                    count: Math.ceil(counts/limit)
                })
            }else{
                const product = await Product.find({promoAvailable: false}).limit(limit).skip(skip).sort({"name":1})
                res.status(200).json({
                    status:"Success",
                    data: product,
                    count:Math.ceil(counts/limit)
                })
            }
    }catch(err){
        console.log(err)
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
            const {restaurant, name} = req.query
            const queryObject = {}
            // if (promoAvailable){
            //     queryObject.promoAvailable = promoAvailable === 'true'? true: false
            // }
            // if(category){
            //     queryObject.category = category
            // }
            if(restaurant){
                queryObject['restaurant'] = {$regex: restaurant, $options: 'i'}
            }
            if(name){
                queryObject.name = {$regex: name, $options: 'i'}
            }
            // if(drink){
            //     queryObject['name.drink.name'] = {$regex: drink, $options: 'i'}
            // }
            // // if(discount){
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
    // create restaurant 
    static async createRestaurant (req,res) {
        const {body:{productName, restaturantName},params:{restaurantId}} = req
        try{
            const product = await Product.findOne({name:productName})
            if(!product || product.length === 0) throw new BadRequestError("Product no found. Please create a product")
            const restaurantExist = await Restaurant.findById({_id:restaurantId}).populate("products","name")
            if(!restaurantExist || restaurantExist === 0){
                const restat = new Restaurant({
                    name:restaturantName,
                    products:[
                        product._id,
                    ]
                })
                await restat.save()
            }
            console.log(product._id)
            console.log(restaurantExist)
            const productItem = await restaurantExist.products.find((item) => {
                return item.name === productName 
            })
            console.log(productItem)
            restaurantExist.products.push([product._id])
            const newRes = await restaurantExist.save()
            if(!newRes || newRes.length === 0){
                throw new BadRequestError("No product created")
            }
        res.status(201).json({
            message: "Success",
            data: product
        })
    }catch(err){
        console.log(err)
        res.status(500).json({message:err.message})
    }
    }

    //update product
    static async updateProduct (req,res) {
        try{
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
        console.log("one")
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
                user: req.user.jwtId
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
        console.log(err)
        res.status(500).json({message:err.message})
    }
    }

    //get the favourite food
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


      //get all restaurants
    static async getAllRestaurants(req,res) {
    try {
        const restaurant = await Product.find({}, /*"eatery.restaurant"*/)
        console.log("one",restaurant)
        if(!restaurant || restaurant.length === 0){
            throw new BadRequestError("Restaurant no found")
        }
        const food = restaurant.map((eat) => {
            return eat.eatery.map((foo) => {
                if(req.query.restaurant === "restaurant"){
                    return foo.restaurant
                }
                if(req.query.food === "food" ){
                    return foo.food.map((item) => {
                        return item
                    })
                }
                if(req.query.drink === "drink"){
                    return foo.drink.map((item) => {
                        return item.find((ite) => {
                            return ite._id.toString() === req.params.iteId
                        })
                    })
                }
                
            })
        })
        console.log("two",food)
        //const rest = restaurant.map((product) => product.eatery.map((restaurant) => restaurant.restaurant)).flat();
        res.status(201).json({
            message:"success",
            data:food
        })
        
    } catch (error) {
     console.error(error);
        throw error;
    }
    }
    static async getByEatery(req,res){
        try {
            const product = await Product.eatery.find({"eatery._id":req.params.eateryId})
            console.log("one",product)
            res.status(201).json({product})
        } catch (err) {
            console.log(err)
            res.status(500).json({message:err.messae})
        }
    }
      
}