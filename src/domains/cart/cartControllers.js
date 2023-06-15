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
      const {body:{products},params:{productId}} = req
      try {
        const userCart = await User.findById({_id:req.user.jwtId})
        console.log(userCart)
        const shopCart = userCart.addToCart(productId)
        if(!shopCart || shopCart.length == 0){
          throw new BadRequestError("cart is empty")
        }
        res.status(201).json(shopCart)
      } catch (error) {
        res.status(500).json({message:err.message})
      }
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
    static async updateCart (req,res) {
      try{
        const newCart = await Cart.findByIdAndUpdate(req.params.cartId,{
            $set:req.body
        },{
            new: true,
            runValidators: true
        })
        if(!newCart){
            throw new BadRequestError("No product created")
        }
        res.status(201).json({
            data: newCart
        })
      }catch(err){
        console.log(err)
        res.status(500).json({message:err.message})
      }
    }

        //delete cart
  static async deleteCart (req,res) {
    try{
    const cart = await Cart.findByIdAndDelete(req.params.cartId)
    if(!cart){
      throw new UnauthorizedError("Product not found")
    }
    res.status(200).json({
      status:"success",
      message:"Product has been deleted"
    })
  }catch(err){
    res.status(500).jsom({message:err.message})
  }
  }

  // find user cart
  static async getCart (req,res) {
    try{
    const cart = await Cart.findOne({user:req.params.userId}).populate("products.productId")
    console.log("one",cart)
    if(!cart){
      throw new UnauthorizedError("user cart not found")
    }
    res.status(200).json({
      status:"success",
      data:cart
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