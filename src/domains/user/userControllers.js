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
import { UnAuthorizedError } from "../../../../../housemanship/mealyApp2/stutern-mealy-group4-team2/src/errors/error.js";


//register a new user
export default class UserController {
  static createUser = trycatchHandler(async(req, res, next ) => {
     // Joi validation
     console.log('hhh')
    const {error, value} = await createUserValidator.validate(req.body)
    if(error){
      console.log(error.details)
      const err = new Error(error.details[0].message)
      err.status = 400
      err.message = error.details[0].message
      return next(err)
    }
    //check if the user Email already exist in the databse  
      console.log('kkk')
        const emailExist = await User.findOne({email: req.body.email})
        if (emailExist){
          return next(createCustomError('Email already already, signup with gmail account', 401))
        }
        console.log('one')
        const otp = randomOtp()
        const uniqueString = randomString();
        console.log('unique', uniqueString)
        const hashedString = await hashData(uniqueString)
        const hashOTP = await hashData(otp)
        //const newUser = await User.create({...req.body})
        console.log('uuid', hashedString)
        const newUser = new User({
          username:req.body.username,
          email:req.body.email,
          password:req.body.password,
          otpVerificationToken: hashOTP,
          emailVerificationToken: hashedString,
          resetPasswordCreatedAt: Date.now(),
          resetPasswordExpires:Date.now() + 10800000,
        })
        await newUser.save()
        console.log('two')
        //handle email verification
        await sendVerificationEmail(newUser, res)
        await sendOTPVericationMail(newUser,otp,res)
        console.log('four')
        res.status(200).json({
        status: "Success",
        message: `Verification token has been seen to ${newUser.email}.`
      })
  })


  //login a rerurning user
  static loginUser = trycatchHandler(async (req, res, next ) => {
    // Joi validation
    const {error, value} = await loginUserValidator.validate(req.body)
    if(error){
      console.log(error.details)
      const err = new Error(error.details[0].message)
      err.status = 400
      err.message = error.details[0].message
      return next(err)
    }
      // check if the email exist
        const emailExist = await User.findOne({email: req.body.email})
        if (!emailExist){
          return next(createCustomError('Email does not exist, verify email or signup', 401))
        }
        //check if the password is correct
        const isCorrectPassword = await emailExist.comparePassword(req.body.password)
        if(!isCorrectPassword){
          throw new UnauthorizedError("Incorrect password")
        }
        //handle email verification
        sendVerificationEmail(newUser, res)
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
  })


  // get user email link
  static getUserEmailLink = trycatchHandler(async (req, res, next ) => {
    const {userId, uniqueString} = req.params
      //get the user verication mail ID
      //const userExist = await UserVerification.find({userId})
      const userExist = await User.find({_id:userId})
      //valid userId
      if(userExist){
        const expiresAt = userExist.resetPasswordExpires;
        //compare if the uniques is valid
        const hashedUniqueString = userExist.emailVerificationToken;
        //check for expires time
        if (expiresAt < Date.now()){
          //user verification does not exist
          const deleteMail = await User.updateOne({userId},{
            emailVerificationToken: undefined,
            resetPasswordExpires: undefined
          })
          if (!deleteMail){
            throw new BadRequestError("Clearing user data failed")
          }
        }else{
            //valid user exist
            //uniques string from params and hashed string fromdatabase
            const validUser = await bcrypt.compare(uniqueString, hashedUniqueString)
            if(!validUser){
              throw new UnauthorizedError("Invalid verification passed")
            }else{
              //update user model by changing the verified
              const verifiedUser = await User.updateOne({_id:userId},{
                isEmailVerified: true,
                emailVerificationToken: undefined,
                resetPasswordExpires: undefined
              })
              await verifiedUser.save()
              if(!verifiedUser){
                throw new BadRequestError("Failed to update user")
              }else{
                //send a html message to the user
                res.status(200).json({
                  status:"Success"
                })
              }
            }
        }
      }else{
        let message = "Account record does'nt exit or has been verified. Please signup or login"
        res.status(402).json({status:"failed",msg:message})
        //res.redirect("/user/verified") //route to redirect error in link
      }
      if (!userExist){
       throw new BadRequestError("Failed to get the link") }
      res.status(500).json({message:"Unique string sent"})
  
  })


  //get a verify email link when error occured 
  static async getUserEmailMsg(req,res,next){
    res.render('verifiedMail')
  }


  // resending verification link
  static resendVericationLink = trycatchHandler(async(req,res, next) => {
       // Joi validation
       const {error, value} = await emailValidator.validate(req.body)
       if(error){
         console.log(error.details)
         const err = new Error(error.details[0].message)
         err.status = 400
         err.message = error.details[0].message
         return next(err)
       }
    const {userId, email} = req.body
    const delAlreadyMail = await User.findOneAndUpdate({_id:userId},{
      emailVerificationToken: undefined,
      resetPasswordCreatedAt: undefined,
      resetPasswordExpires: undefined
    })
    await delAlreadyMail.save()
    if(!delAlreadyMail){
      throw new BadRequestError("Verification resend error")
    }
    sendVerificationEmail({_id:userId, email},res)
  })


  //verify OTP Email
  static verifyOTP = trycatchHandler(async(req,res,next) => {
     // Joi validation
     const {error, value} = await verifyOTPValidator.validate(req.body)
     if(error){
       console.log(error.details)
       const err = new Error(error.details[0].message)
       err.status = 400
       err.message = error.details[0].message
       return next(err)
     }
    const {userId, otp} = req.body
    //check if the user OTP exists
    const userOTPverifyID = await User.findById({_id:userId})
    console.log("here",userOTPverifyID)
    if (!userOTPverifyID){
      throw new UnauthorizedError("Account is invalid or has been valid already")
    }
    //check if the otp has not expired
    const expiresAt = userOTPverifyID.resetPasswordExpires
    const hashedOTP = userOTPverifyID.otpVerificationToken
    console.log("one", hashedOTP)
    if(userOTPverifyID.isEmailVerified){
      throw new UnauthorizedError("You have been verified. Please login with your email and password")
    }
    if (expiresAt < Date.now()){
      // otp has expired, delete from the record
      const deleteOTP = await User.findOneAndUpdate({_id:userId},{
        resetPasswordExpires:undefined,
        otpVerificationToken: undefined,
        resetPasswordCreatedAt: undefined
      })
      await deleteOTP.save()
      throw new UnauthorizedError("OTP has expired, please request again")
    }
    console.log("two")
    //hash valid otp
    //const salt = await bcrypt.genSalt(10)
    if (otp !== hashedOTP){
      throw new UnauthorizedError("Invalid code passed, check again")
    }
    //update valid otp user
    const user = await User.updateOne({_id:userId},{
      isEmailVerified: true,
      resetPasswordExpires:undefined,
      otpVerificationToken: undefined,
      resetPasswordCreatedAt: undefined
    })
    console.log("three")
    await user.save()
    console.log("five")
    res.status(201).json({
      status:"Success",
      message:"User email verified successfully"
    })
  })


//resed otp, if it has expired
static resendOTPVerification = trycatchHandler(async(req,res,next) => {
         // Joi validation
         const {error, value} = await emailValidator.validate(req.body)
         if(error){
           console.log(error.details)
           const err = new Error(error.details[0].message)
           err.status = 400
           err.message = error.details[0].message
           return next(err)
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
             console.log(error.details)
             const err = new Error(error.details[0].message)
             err.status = 400
             err.message = error.details[0].message
             return next(err)
           }
    const {email, redirectUrl} = req.body
    //check if email exist
    const emailExist = await User.findOne({email})
    if(!emailExist){
      throw new UnauthorizedError("Invalid email account, please check your email")
    }
    //check if the email is verified
    if(!emailExist.isEmailVerified){
      throw new BadRequestError("The link send to your email is not verified")
    }
    //send a password request url,if verified valid account is found
    sendResetEmail(emailExist, redirectUrl,res)
  })


  //reset password
  static resetPassword = trycatchHandler(async(req,res,next) => {
           // Joi validation
           const {error, value} = await resetPasswordValidator.validate(req.body)
           if(error){
             console.log(error.details)
             const err = new Error(error.details[0].message)
             err.status = 400
             err.message = error.details[0].message
             return next(err)
           }
    const {userId, resetString, newPassword} = req.body
    //check if the user exist in db
    const foundResetLink = await User.find({_id:userId});
    if (!foundResetLink){
      throw new UnauthorizedError("Checking for exist password reset failed")
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
    const salt = await bcrypt.genSalt(10)
    const genPass = await bcrypt.hash(newPassword, salt)
    //update the new password in user db
    const newPass = await User.updateOne({_id:userId},{password:genPass})
    if (!newPass){
      throw new BadRequestError("Password reset failed, try again later")
    }
    const deleteOld = await User.findOneAndUpdate({_id:userId},{
      resetPasswordExpires:undefined,
      passwordResetToken: undefined,
      resetPasswordCreatedAt: undefined
    })
    if (!deleteOld){
      throw new BadRequestError("Error occurred while updating password, try again later")
    }
    //password updating successfull
    return res.status(201).json({msg:"Password update successful"})
  })


  //refresh token handler
  static async refresh (req,res){
    //access cookie to cookies
    const cookies = req.cookies
    //check if cookies exist
    if(!cookies?.jwt) return res.sendStatus(401)
    const refreshTokenCookie = cookies.jwt
    //find from record the cookie user
    const foundUser = await User.findOne({refreshToken:refreshTokenCookie})
    if (!foundUser) return res.sendStatus(403)
    jwt.verify(refreshTokenCookie,process.env.REFRESH_TOKEN,(err,decoded) => {
        if(err || foundUser.user !== decoded.username) return res.status(403)
        const acctoke = foundUser.accessJwtToken()
        res.status(201).json(acctoke)
    })
  }

  //logout controller
  static async logout (req,res){
    //on the client delete the access token
    //access cookie to cookies
    const cookies = req.cookies
    //check if cookies exist
    if(!cookies?.jwt) return res.sendStatus(204) //no content
    //if there is a cookie in the req
    const refreshTokenCookie = cookies.jwt
    //find from db if there is refresh token
    const foundUser = await User.findOne({refreshToken:refreshTokenCookie})
    if (!foundUser) {
      //clear the cookies the cookie though not found in the db
      res.clearCookie("jwt",{httpOnly: true, maxAge:24*60*60*1000})
      return res.sendStatus(204) //successful but not content
    }
    //delete the refresh token in the db
    foundUser.refreshToken = ""
    await foundUser.save()
    res.clearCookie("jwt",{httpOnly: true, maxAge: 24*60*60*1000})
    res.sendStatus(204)
  }
  
  //user profile
  static async profile (req,res){
    try {
      const user = await User.findById(req.user._id)
      if(user){
        res.status(200).json({
          username: user.username,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
        })
      }else{
        res.status(404).json({message:"Sorry, you data is found, try to register"})
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
      const user = await User.findById(req.user._id)
      if(user){
          user.username = req.body.username || user.username,
          user.name = req.body.name || user.name,
          user.email = req.body.email || user.email
      }
      if(req.body.password){
        user.password = req.body.password
      }
      const updateUser = await user.save()
      res.status(200).json({
        username: updateUser.username,
        name: updateUser.name,
        email: updateUser.email,
        isAdmin: updateUser.isAdmin,
        token : updateUser.accessJwtToken()
      })
    } catch (err) {
      res.status(404).json({
        status:"Failed",
        message:"Sorry, you data is found, try to register"
      })
    }
  }

  //delete user
  static deleteUser = trycatchHandler(async (req,res,next) => {
    const user = await User.findByIdAndDelete(req.params.id)
    if(!user){
      throw new UnauthorizedError("User not found")
    }
    res.status(200).json({
      status:"success",
      message:"User has been deleted"
    })
  })
  // admin finds any user
  static findUser = trycatchHandler(async (req,res,next) => {
    const user = await User.findById(req.params.id)
    if(!user){
      throw new UnauthorizedError("User not found")
    }
    const {password, ...others} = user._doc
    res.status(200).json({
      status:"success",
      data:others
    })
  })

    // admin finds all users
    static findAllUser = trycatchHandler(async (req,res,next) => {
      const users = await User.find({})
      if(!users){
        throw new UnauthorizedError("User not found")
      }
      const {password, ...others} = users._doc
      res.status(200).json({
        status:"success",
        data:others
      })
    })
}
 