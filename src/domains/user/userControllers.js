import User from "./UserModel.js";
import {v4 as uuidv4} from "uuid";
import sendVerificationEmail from "../../util/mail.js";
import {sendResetEmail} from "../../util/mail.js"
import { sendOTPVericationMail } from "../../util/mail.js";
import { trycatchHandler } from "../../middlewares/trycatchHandler.js";
import { createUserValidator } from "../../middlewares/joiSchemaValidation.js";
import { loginUserValidator } from "../../middlewares/joiSchemaValidation.js";
import { emailValidator } from "../../middlewares/joiSchemaValidation.js";
import { resetPasswordValidator } from "../../middlewares/joiSchemaValidation.js";
import { createCustomError } from "../../errors/customError.js";
import { verifyOTPValidator } from "../../middlewares/joiSchemaValidation.js";
//import UserVerification from "../database/model/UserVerification.js";
//import PasswordReset from "../database/model/PasswordReset.js";
import BadRequestError from "../../errors/badRequestError.js";
import bcrypt from "bcrypt";
import UnauthorizedError from "../../errors/unAuthorizedError.js";
//import OTPVerification from "../database/model/OTPVerification.js";
import jwt from "jsonwebtoken";
import { hashData } from "../../util/hashData.js";
import {randomString, randomOtp} from "../../util/randomString.js";



//register a new user
export default class UserController {
  static createUser = trycatchHandler(async(req, res, next ) => {
     // Joi validation
    const {error, value} = await createUserValidator.validate(req.body)
    if(error){
      // console.log(error.details)
      // const err = new Error(error.details[0].message)
      // err.status = 400
      // err.message = error.details[0].message
      // return next(err)
      res.status(400).json(error.message)
    }
    const {username,password,email,firstName,lastName} = req.body
    //check if the user Email already exist in the databse  
        const emailExist = await User.findOne({email})
        if (emailExist){
          return next(createCustomError('Email already already, signup with gmail account', 401))
        }
        //hash otp code and string
        const otp = randomOtp()
        const uniqueString = randomString()
        const hashedString = await hashData(uniqueString)
        const hashOTP = await hashData(otp)
        const hashPassword = await hashData(password)
        //create new user
        const newUser = new User({
          username,
          email,
          password:hashPassword,
          firstName,
          lastName,
          otpVerificationToken: hashOTP,
          emailVerificationToken: hashedString,
          resetPasswordCreatedAt: Date.now(),
          resetPasswordExpires:Date.now() + 10800000
        })
        await newUser.save()
        //handle email verification
        await sendVerificationEmail(newUser,uniqueString,res)
        await sendOTPVericationMail(newUser,otp,res)
        res.status(200).json({
        status: "Success",
        message: `Verification token has been seen to ${newUser.email}.`
      })
  })


  //login a rerurning user
  static async loginUser (req, res){
    // Joi validation
    const {error, value} = await loginUserValidator.validate(req.body)
    if(error){
      // console.log(error.details)
      // const err = new Error(error.details[0].message)
      // err.status = 400
      // err.message = error.details[0].message
      // return next(err)
      res.status(400).json(error.message)
    }
    try{
    const {email,password} = req.body
      // check if the email exist
        const emailExist = await User.findOne({email})
        if (!emailExist){
          return next(createCustomError('Email does not exist, verify email or signup', 401))
        }
        if(!emailExist.isEmailVerified) throw new UnauthorizedError("Verify with the code send to you to login")
        //check if the password is correct
        const isCorrectPassword = await bcrypt.compare(password, emailExist.password)
        if(!isCorrectPassword) throw new UnauthorizedError("Incorrect password")
          //generate jwt token
        const accessToken = emailExist.accessJwtToken()
        const refreshJwt = emailExist.refreshJwtToken()
        await User.updateOne({email},{refreshToken:refreshJwt})
        res.cookie("jwt",refreshJwt,{httpOnly: true, maxAge:24*60*60*1000})
        res.status(200).json({
        message: "User login successfully",
        status: "Success",
        data:{
          user: emailExist.username,
          userToken: accessToken
        }
      })
    }catch(err){
      res.status(500).json({message:err.message})
    }
  }


  //get user email link to verify
  static async getUserEmailLink (req, res) {
    const {userId, uniqueString} = req.params
      //get the user verication mail ID
      //const userExist = await UserVerification.find({userId})
      try{
      const userExist = await User.findById({_id:userId}).exec()
      //valid userId
      if(userExist){
        const expiresAt = await userExist.resetPasswordExpires
        //compare if the uniques is valid
        const hashedUniqueString = await userExist.emailVerificationToken
        //check for expires time
        if (expiresAt < Date.now()){
          //user verification does not exist
          userExist.emailVerificationToken = undefined
          userExist.resetPasswordExpires = undefined
          await userExist.save()
          throw new UnauthorizedError("Token has expired, resend to get a new token")
          
        }
        //valid user exist
        //uniques string from params and hashed string fromdatabase
        const validUser = await bcrypt.compare(uniqueString, hashedUniqueString)
        if(!validUser){
            throw new UnauthorizedError("Invalid verification passed")
          }
              //update user model by changing the verified
        userExist.isEmailVerified = true
        userExist.emailVerificationToken = undefined
        userExist.resetPasswordExpires = undefined 
        await userExist.save()
        //send a html message to the user
        res.status(200).json({status:"Success"})
      }else{
        let message = "Account record does'nt exit or has been verified. Please signup or login"
        res.status(402).json({status:"failed",msg:message})
        //res.redirect("/user/verified") //route to redirect error in link
      }
    }catch(err){
      res.status(500).json({message:err.message})
    }
  }



  //get a verify email link when error occured 
  static async getUserEmailMsg(req,res,next){
    res.render('verifiedMail')
  }


  // resending verification link
  static resendVericationLink = trycatchHandler(async(req,res, next) => {
       // Joi validation
       const {error, value} = await emailValidator.validate(req.body)
       if(error){
        //  console.log(error.details)
        //  const err = new Error(error.details[0].message)
        //  err.status = 400
        //  err.message = error.details[0].message
        //  return next(err)
        res.status(400).json(error.message)
       }
    const {email} = req.body
    const delAlreadyMail = await User.findOne({email}).exec()
    if(!delAlreadyMail){
      throw new BadRequestError("Verification resend error. Please try again")
    }
    const uniqueString = randomString()
    const hashedString = await hashData(uniqueString)
    delAlreadyMail.emailVerificationToken = hashedString
    delAlreadyMail.resetPasswordCreatedAt = Date.now()
    delAlreadyMail.resetPasswordExpires = Date.now() + 21600000
    await delAlreadyMail.save()
    await sendVerificationEmail(delAlreadyMail,uniqueString,res)
    res.status(200).json({
      status:"Success",
      message:`Link send to your email, ${email}`
    })
  })


  //verify OTP Email
  static async verifyOTP (req,res,next){
     // Joi validation
    
     const {error, value} = await verifyOTPValidator.validate(req.body)
     if(error){
      //  console.log(error.details)
      //  const err = new Error(error.details[0].message)
      //  err.status = 400
      //  err.message = error.details[0].message
      //  return next(err)
      res.status(400).json(error.message)
     }
     try{
    const {params:{userId},body:{otp}} = req
    //check if the user OTP exists
    const userOTPverifyID = await User.findById({_id:userId})
    if (!userOTPverifyID){
      throw new UnauthorizedError("Account is invalid or has been valid already")
    }
    //check if the otp has not expired
    const expiresAt = userOTPverifyID.resetPasswordExpires
    const hashedOTP = userOTPverifyID.otpVerificationToken
    if(userOTPverifyID.isEmailVerified){
      throw new UnauthorizedError("You have been verified. Please login with your email and password")
    }
    if (expiresAt < Date.now()){
      // otp has expired, delete from the record
        userOTPverifyID.resetPasswordExpires = undefined,
        userOTPverifyID.otpVerificationToken = undefined,
        userOTPverifyID.resetPasswordCreatedAt = undefined
  
      await userOTPverifyID.save()
      throw new UnauthorizedError("OTP has expired, please request again")
    }
    //hash valid otp
    //const salt = await bcrypt.genSalt(10)
    const isMatch = await bcrypt.compare(otp,hashedOTP)
    if (!isMatch){
      throw new UnauthorizedError("Invalid code passed, check again")
    }
    //update valid otp user
    userOTPverifyID.isEmailVerified = true,
    userOTPverifyID.resetPasswordExpires = undefined,
    userOTPverifyID.otpVerificationToken = undefined,
    userOTPverifyID.resetPasswordCreatedAt = undefined
    await userOTPverifyID.save()
    res.status(201).json({
      status:"Success",
      message:"User email verified successfully"
    })
  }catch(err){
    console.log(err)
    res.status(500).json({message:err.message})
  }
  }


//resed otp, if it has expired
static resendOTPVerification = trycatchHandler(async(req,res,next) => {
         // Joi validation
         const {error, value} = await emailValidator.validate(req.body)
         if(error){
          //  console.log(error.details)
          //  const err = new Error(error.details[0].message)
          //  err.status = 400
          //  err.message = error.details[0].message
          //  return next(err)
          res.status(400).json(error.message)
         }
  const {email} = req.body
  // delete otp in record
  const otpDel = await User.findOne({email:email})
  if(!otpDel){
    throw new BadRequestError("Please resend, cannot find your ID")
  }
  const otp = randomOtp()
  const hashOtp = await hashData(otp)
  otpDel.resetPasswordExpires = Date.now() + 10800000
  otpDel.otpVerificationToken = hashOtp
  otpDel.resetPasswordCreatedAt = Date.now()
  await otpDel.save()
  //send otp to email
  await sendOTPVericationMail(otpDel,otp, res)
  res.status(201).json({
    status:"Success",
    message:"Check your mail for new code"
  })
 })


  //request password reset link
  static requestPasswordReset = trycatchHandler(async(req,res,next) => {
           // Joi validation
           const {error, value} = await emailValidator.validate(req.body)
           if(error){
            //  console.log(error.details)
            //  const err = new Error(error.details[0].message)
            //  err.status = 400
            //  err.message = error.details[0].message
            //  return next(err)
            res.status(400).json(error.message)
           }
    const {email} = req.body
    //check if email exist
    const emailExist = await User.findOne({email})
    if(!emailExist){
      throw new UnauthorizedError("Invalid email account, please check your email")
    }
    //check if the email is verified
    if(!emailExist.isEmailVerified){
      throw new BadRequestError("You have not been verified.Click the link send to you or resend verification to be verified")
    }
    //update databse
    const resetString = randomString()
    const hashedString = await hashData(resetString)
    emailExist.passwordResetToken = hashedString,
    emailExist.resetPasswordCreatedAt = Date.now(),
    emailExist.resetPasswordExpires = Date.now() + 1800000
  await emailExist.save()
    //send a password request url,if verified valid account is found
  await sendResetEmail(emailExist,resetString, res)
      //email sent successfully
  return res.status(201).json({message:"Email sent successfully"})
  })


  //reset password
  static resetPassword = trycatchHandler(async(req,res,next) => {
           // Joi validation
           const {error, value} = await resetPasswordValidator.validate(req.body)
           if(error){
            //  console.log(error.details)
            //  const err = new Error(error.details[0].message)
            //  err.status = 400
            //  err.message = error.details[0].message
            //  return next(err)
            res.status(400).json(error.message)
           }
    const {params:{userId, resetString},body:{newPassword}} = req
    //check if the user exist in db
    const foundResetLink = await User.findById({_id:userId});
    if (!foundResetLink){
      throw new UnauthorizedError("User ID could not be found to sete password")
    }
    //check if the found reset has not expired
    const expiresAt = foundResetLink.resetPasswordExpires
    if (expiresAt < Date.now()){
      //await PasswordReset.deleteOne({userId})
      throw new UnauthorizedError("Sorry, your link has expired, press reset button to genearte new one")
    } 
    //reset password record still valid
    const isMatch = await bcrypt.compare(resetString, foundResetLink.passwordResetToken)
    if (!isMatch){
      throw new UnauthorizedError("Incorrect password record, try again")
    }
    //if the passwords match, store it in databse
    const genPass = await hashData(newPassword)
    //update the new password in user db
    foundResetLink.password = genPass
    foundResetLink.resetPasswordExpires = undefined,
    foundResetLink.passwordResetToken = undefined,
    foundResetLink.resetPasswordCreatedAt = undefined
    await foundResetLink.save()
    //password updating successfull
    return res.status(201).json({msg:"Password updated successful"})
  })


  //refresh token handler
  static async refresh (req,res){
    //access cookie to cookies
    const cookies = req.Cookies
    //check if cookies exist
    console.log("one", cookies)
    if(!cookies?.jwt) return res.sendStatus(401)
    const refreshTokenCookie = cookies.jwt
    console.log("two", refreshTokenCookie)
    //find from record the cookie user
    const foundUser = await User.findOne({refreshToken:refreshTokenCookie})
    console.log("three",foundUser)
    if (!foundUser) return res.sendStatus(403)
    jwt.verify(refreshTokenCookie,process.env.REFRESH_TOKEN,(err,decoded) => {
        if(err || foundUser._id !== decoded._id) return res.status(403)
        const acctoke = foundUser.accessJwtToken()
        res.status(201).json(acctoke)
    })
  }

  //logout controller
  static async logout (req,res){
    //on the client delete the access token
    //access cookie to cookies
    const cookies = req.Cookies
    //check if cookies exist
    console.log("aaa")
    if(!cookies?.jwt) return res.sendStatus(204) //no content
    //if there is a cookie in the req
    const refreshTokenCookie = cookies.jwt
    console.log("one")
    //find from db if there is refresh token
    const foundUser = await User.findOne({refreshToken:refreshTokenCookie})
    if (!foundUser) {
      //clear the cookies the cookie though not found in the db
      console.log("two")
      res.clearCookie("jwt",{httpOnly: true, maxAge:24*60*60*1000})
      return res.sendStatus(204) //successful but not content
    }
    console.log("three")
    //delete the refresh token in the db
    foundUser.refreshToken = ""
    await foundUser.save()
    res.clearCookie("jwt",{httpOnly: true, maxAge: 24*60*60*1000})
    res.send(204).json({message:"You have been logged out"})
  }
  
  //user profile
  static async profile (req,res){
    try {
      const user = await User.findById({_id:req.user.jwtId})
      if(user){
        res.status(200).json({
          username: user.username,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
        })
      }else{
        res.status(404).json({message:"Sorry, you data is not found, try to register"})
      }
    } catch (err) {
      res.status(404).json({
        status:"Failed",
        message:err.message
      })
    }
  }
  //update user profile
  static async updateProfile (req,res){
    try {
      const user = await User.findByIdAndUpdate({_id:req.params.userId},{$set:req.body},{
        new: true,
        runValidators: true
      })
      // if(user){
      //     user.username = req.body.username || user.username,
      //     user.name = req.body.name || user.name,
      //     user.email = req.body.email || user.email
      // }
      // if(req.body.password){
      //   user.password = req.body.password
      // }
      // const updateUser = await user.save()
      res.status(200).json({
        username: user.username,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token : user.accessJwtToken()
      })
    } catch (err) {
      res.status(404).json({
        status:"Failed",
        message:err.message
      })
    }
  }

  //delete user
  static async deleteUser (req,res){
    try{
    const user = await User.findByIdAndDelete(req.params.userId)
    if(!user){
      throw new UnauthorizedError("User not found")
    }
    res.status(200).json({
      status:"success",
      message:"User has been deleted"
    })
  }catch(err){
    res.status(500).json({message:err.message})
  }
  }
  // admin finds any user
  static async findUser (req,res){
    try{
    const user = await User.findById(req.params.id)
    if(!user){
      throw new UnauthorizedError("User not found")
    }
    const {password, ...others} = user._doc
    res.status(200).json({
      status:"success",
      data:others
    })
  }catch(err){
    res.status(500).json({message:err.message})
  }
  }

    // admin finds all users
    static async findAllUser (req,res){
      try{
      const users = await User.find({})
      if(!users){
        throw new UnauthorizedError("User not found")
      }
      const {password, ...others} = users._doc
      res.status(200).json({
        status:"success",
        data:others
      })
    }catch(err){
      res.status(500).json({message:err.message})
    }
    }
}
 