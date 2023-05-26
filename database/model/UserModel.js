import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const UserSchema = new mongoose.Schema({
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
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
    verified:{
      type: Boolean,
      default: false
    }, 
    refreshToken:String,
    // emailVerification:String,
    // otpVerification: String,
    // passwordReset: String,
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

  UserSchema.pre('save', async function(next){
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
})
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
  export default mongoose.model('User', UserSchema)