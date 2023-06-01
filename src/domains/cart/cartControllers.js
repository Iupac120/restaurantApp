import BadRequestError from "../../errors/badRequestError.js"
import { trycatchHandler } from "../../middlewares/trycatchHandler.js"
import Cart from "./cartModel.js"

export default class CartController {
    //create cart
    static createCart = trycatchHandler(async (req,res) => {
        const cart = new Cart(req.body)
        const newCart = await cart.save()
        if(!newCart){
            throw new BadRequestError("No cart created")
        }
        res.status(201).json({
            data: newCart
        })
    })

    //update cart
    static updateCart = trycatchHandler(async (req,res) => {
        const newCart = await Cart.findByIdAndUpdate(req.params.id,{
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
    })

        //delete cart
  static deleteCart = trycatchHandler(async (req,res) => {
    const cart = await Cart.findByIdAndDelete(req.params.id)
    if(!cart){
      throw new UnauthorizedError("Product not found")
    }
    res.status(200).json({
      status:"success",
      message:"Product has been deleted"
    })
  })

  // find user cart
  static getCart = trycatchHandler(async (req,res,next) => {
    const cart = await Cart.findOne(req.user._id)
    if(!cart){
      throw new UnauthorizedError("User not found")
    }
    res.status(200).json({
      status:"success",
      data:cart
    })
  })

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