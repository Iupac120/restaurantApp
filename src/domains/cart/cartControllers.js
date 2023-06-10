import BadRequestError from "../../errors/badRequestError.js"
import UnauthorizedError from "../../errors/unAuthorizedError.js"
import { trycatchHandler } from "../../middlewares/trycatchHandler.js"
import Cart from "./cartModel.js"

export default class CartController {
    //create cart
    static async createCart (req,res) {
      try{
        const cart = new Cart(req.body)
        const newCart = await cart.save()
        if(!newCart){
            throw new BadRequestError("No cart created")
        }
        res.status(201).json({
            data: newCart
        })
      }catch(err){
        console.log(err)
        res.status(500).json({message:err.message})
      }
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
    const cart = await Cart.find({user:req.params.userId})
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