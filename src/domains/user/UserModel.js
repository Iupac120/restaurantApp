import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const UserSchema = new mongoose.Schema({
    username: {
      type: String,
      required: true,
      min: 3,
      max: 255,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      immutable: true,
      validators: {
        match: [/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/, "Please add a valid email string to the email path."]
      }
    },
    password: {
      type: String,
      required: true,
    },
    isEmailVerified:{
      type: Boolean,
      default: false
    },
    isAdmin:{
      type: Boolean,
      default: false
    },
    refreshToken:{
      type: String,
      default: null
    },
     emailVerificationToken: {
      type: String,
      default: null
     },
     otpVerificationToken: {
      type: String,
      default: null
     },
     passwordResetToken: {
      type: String,
      default: null
     },
     resetPasswordExpires:{
      type: Date,
      default: null
     },
     resetPasswordCreatedAt:{
      type: Date,
      default: null
     },
     cart:{
      items:[
        {
            productId:{
                type: mongoose.Schema.Types.ObjectId,
                ref:"Product"
            },
            quantity:{
                type: Number,
                default:0
            }
        },
       ],
       totalPrice:{
        type:Number,
        required: true,
        default:0
    },
     },
    firstName: String,
    lastName: String,
    fullName: String,
  }, {
    timestamps: true
  })
  
  UserSchema.pre("save", function(next){
    this.fullName = this.firstName + " " +  this.lastName 
    next()
  })

// UserSchema.pre('save', async function(next){
//     const salt = await bcrypt.genSalt(10)
//     this.password = await bcrypt.hash(this.password, salt)
//     next()
// })
UserSchema.methods.accessJwtToken = function (){
return jwt.sign({userId:this._id, username:this.username},process.env.ACCESS_TOKEN,{expiresIn:process.env.ACCESS_LIFETIME})
} 

UserSchema.methods.refreshJwtToken = function (){
  return jwt.sign({userId:this._id, username:this.username},process.env.REFRESH_TOKEN,{expiresIn:process.env.REFRESH_LIFETIME})
  }  

UserSchema.methods.comparePassword = async function(candidatePassword){
  const isMatch =  await bcrypt.compare(candidatePassword, this.password);
  return isMatch;
}
UserSchema.methods.addToCart =  function(product){
  let cart = this.cart
  if(cart.items.length == 0){
    cart.items.push({productId:product._id, quantity:1})
    cart.totalPrice = product.price
  }else{
    const isExisting =  cart.item.findIndex(objectId => objectId.productId == product._id)
    if(isExisting == -1){//if the product does not exist
      cart.items.push({productId:product._id,quantity:1})
      cart.totalPrice += product.price
    }else{
      const existingProductInCart = cart.items[isExisting]
      existingProductInCart.quantity += 1
      cart.totalPrice  += product.price
    }
  }
}


export default mongoose.model("User", UserSchema)