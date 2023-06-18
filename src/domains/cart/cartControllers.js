import BadRequestError from "../../errors/badRequestError.js"
import UnauthorizedError from "../../errors/unAuthorizedError.js"
import { trycatchHandler } from "../../middlewares/trycatchHandler.js"
import { calculateOrderAmount } from "../../util/totalOrderPrice.js"
import Product from "../product/ProductModel.js"
import User from "../user/UserModel.js"
import Cart from "./cartModel.js"

export default class CartController {
    //create cart
    static async addToCart (req,res) {
        const {body:{
            address,
            paymentMethod},params:{productId}
        } = req
        try{
            const  product  = await Product.findById({_id:productId})
            const productTotalPrice = product.discount > 0? product.price - (product.price*(product.discount/100)) : product.price
            console.log("discount",productTotalPrice)
            if(!product && product.length === 0){
                throw new BadRequestError("Product not found")
            }
            const  user  = await User.findById({_id:req.user.jwtId})
            if(!user) throw new UnauthorizedError("Please sign up to create a cart")
            console.log(user.cart.items)
            if(user.cart.items.length === 0){
                user.cart.items.push({productId:product._id, quantity: 1})
                user.cart.totalPrice = productTotalPrice//product.price
                const updatedUser = await user.save()
                res.status(201).json(updatedUser)
            }else{
                const isExisting =  user.cart.items.findIndex(objectId => new String(objectId.productId).trim() == new String(product._id).trim())
                if(isExisting == -1){//if the product does not exist
                    user.cart.items.push({productId:product._id,quantity:1})
                    user.cart.totalPrice += productTotalPrice//product.price
                }else{
                    const existingProductInCart = user.cart.items[isExisting]
                    existingProductInCart.quantity += 1
                    user.cart.totalPrice  += productTotalPrice//product.price
                }
                const mealCart = await user.save()
                res.status(201).json(mealCart.cart)
            }
            
        }catch(err){
        res.status(500).json({message:err.message})
    }
      // const {params:{productId}} = req
      // try {
      //   const userCart = await User.findById({_id:req.user.jwtId})
      //   const product = await Product.findById(productId)
      //   const shopCart = await userCart.addToCart(product)
      //   if(!shopCart || shopCart.length === 0){
      //     throw new BadRequestError("cart is empty")
      //   }
      //   res.status(201).json(shopCart)
      // } catch (err) {
      //   res.status(500).json({message:err.message})
      // }
      //try{
      //   console.log("one")
      //   const cart = await Cart.findOne({user:req.user.jwtId})
      //   if(cart){
      //     //check if the product exist in the cart
      //     const existingProduct = cart.products.find((item) => {
      //       item.productId.equals(productId)
      //     })
      //     console.log("one", existingProduct)
      //     if(existingProduct){
      //       existingProduct.quantity += 1
      //     }else{
      //       console.log("one")
      //       cart.products.push([{productId,quantity:1}])
      //     }
      //     cart.totalPrice = calculateOrderAmount(cart.products)
      //     console.log("one", cart.totalPrice)
      //   }else{
      //     console.log("faile start")
      //     const newCart = new Cart({
      //       user:req.user.jwtId,
      //       products:[{productId,quantity:1}],
      //       totalPrice:calculateOrderAmount([{productId,quantity:1}])
      //     })
      //     await newCart.save()
      //     console.log("one",newCart)
        
      //   }
      //   console.log("price start")
      //   // const productPrice = await  Product.findById(productId,'price')
      //   // cart.totalPrice = cart.products.reduce((total,product) =>{
      //   // console.log("cart start")
      //   //   const {productId, quantity} = product
      //   //   //const productPrice = await  Product.findById(productId,'price')
      //   //   console.log("price",productPrice)
      //   //   return total + productPrice*quantity
      //   // }, 0)
      //   console.log("type", typeof(cart.totalPrice))
      //   const shopCart = await cart.save()
      //   if(!shopCart){
      //       throw new BadRequestError("No cart created")
      //   }
      //   res.status(201).json({
      //       data: shopCart
      //   })
      // }catch(err){
      //   console.log(err)
      //   res.status(500).json({message:err.message})
      // }
    }

    // Remove a single product from cart
    static async removeFromCart (req,res){
      const {params:{productId}
    } = req
    try{
        const  product  = await Product.findById({_id:productId})
        const productTotalPrice = product.discount > 0? product.price - (product.price*(product.discount/100)) : product.price
        console.log("discount",productTotalPrice)
        if(!product && product.length === 0){
            throw new BadRequestError("Product not found")
        }
        const  user  = await User.findById({_id:req.user.jwtId})
        if(!user) throw new UnauthorizedError("Please sign up to create a cart")
        console.log(user.cart.items)
        if(user.cart.items.length === 0){
          throw new BadRequestError("Cart is empty")
            user.cart.items.push({productId:product._id, quantity: 1})
            user.cart.totalPrice = productTotalPrice//product.price
            const updatedUser = await user.save()
            res.status(201).json(updatedUser)
        }else{
            const isExisting =  user.cart.items.findIndex(objectId => new String(objectId.productId).trim() == new String(product._id).trim())
            if(isExisting == -1){//if the product does not exist
              throw new BadRequestError("Product not found")
                user.cart.items.push({productId:product._id,quantity:1})
                user.cart.totalPrice += productTotalPrice//product.price
            }else{
                const existingProductInCart = user.cart.items[isExisting]
                if(existingProductInCart.quantity === 1){
                  user.cart.items.pull(existingProductInCart)
                }else{
                  existingProductInCart.quantity -= 1
                }
                user.cart.totalPrice  -= productTotalPrice//product.price
            }
            
            const mealCart = await user.save()
            res.status(201).json(mealCart.cart)
        }
        
    }catch(err){
    res.status(500).json({message:err.message})
}
    }
// save to cart in the front end

    static save(product){
      let cart = null
      if (cart === null){
        cart = {products: [],totalPrice: 0}
      }
      const existingProductIndex =  cart.products.findIndex(p => p.id == product.id)
      if(existingProductIndex > 0){//product exist
        const existingProduct = cart.products[existingProductIndex]
        existingProduct.quantity += 1
      }else{//product does not exist
        product.quantity = 1,
        cart.products.push(product)
      }
      cart.totalPrice += product.price
    }
    //update cart
    static async editCart (req,res) {
      const {params:{productId}
    } = req
    try{
        const  product  = await Product.findById({_id:productId})
        const productTotalPrice = product.discount > 0? product.price - (product.price*(product.discount/100)) : product.price
        console.log("discount",productTotalPrice)
        if(!product && product.length === 0){
            throw new BadRequestError("Product not found")
        }
        const  user  = await User.findById({_id:req.user.jwtId})
        if(!user) throw new UnauthorizedError("Please sign up to create a cart")
        console.log(user.cart.items)
        if(user.cart.items.length === 0){
            throw new UnauthorizedError("Cart is empty")
        }else{
            const isExisting =  user.cart.items.find(objectId => new String(objectId.productId).trim() == new String(product._id).trim())
            if(isExisting == -1){//if the product does not exist
                throw new BadRequestError("Product is not in cart")
            }else{
                user.cart.items.pull(isExisting)
                user.cart.totalPrice  -= productTotalPrice*isExisting.quantity//product.price
            }
            const mealCart = await user.save()
            res.status(201).json(mealCart.cart)
        }
        
    }catch(err){
    res.status(500).json({message:err.message})
}
    }

        //delete cart
  static async deleteCart (req,res) {
    try{
      const user = await User.findById({_id:req.user.jwtId})
      if(!user){
        throw new UnauthorizedError("Please login or register to create a cart")
      }
      user.cart = null;
      await user.save()
      res.status(200).json({
        status:"success",
        message:"Cart empty",
      })
    }catch(err){
      console.log(err)
      res.status(500).json({message:err.message})
    }
  }

  // find user cart
  static async getCart (req,res) {
    try{
    const cart = await User.findById({_id:req.user.jwtId})
    if(!cart){
      throw new UnauthorizedError("Please login or register to create a cart")
    }
    res.status(200).json({
      status:"success",
      data:cart.cart
    })
  }catch(err){
    console.log(err)
    res.status(500).json({message:err.message})
  }
  }

  //get all carts
  static getAllCart = trycatchHandler(async (req,res) => {
    const carts =  await Cart.find({})
    if(!carts){
        throw new BadRequestError("Cart is not available")
    }
    res.status(201).json({
        data: carts
    })
  })
}