import User from "../database/model/UserModel.js";
import sendVerificationEmail from "./verificationMail.js";
import {sendResetEmail} from "./verificationMail.js"
import { sendOTPVericationMail } from "./verificationMail.js";
import { trycatchHandler } from "../middlewares/trycatchHandler.js";
import { createUserValidator } from "../middlewares/joiSchemaValidation.js";
import { loginUserValidator } from "../middlewares/joiSchemaValidation.js";
import { createCustomError } from "../errors/customError.js";
import UserVerification from "../database/model/UserVerification.js";
import PasswordReset from "../database/model/PasswordReset.js";
import BadRequestError from "../errors/badRequestError.js";
import bcrypt from "bcrypt";
import { hashData } from "../../util/hashData.js";
import UnauthorizedError from "../errors/unAuthorizedError.js";
import OTPVerification from "../database/model/OTPVerification.js";

//register a new user
export default class UserController {
  static createUser = trycatchHandler(async(req, res, next ) => {
    // Joi validation
    const {error, value} = await createUserValidator.validate(req.body)
    if(error){
      console.log(error.details)
      const err = new Error(error.details[0].message)
      err.status = 400
      err.message = error.details[0].message
      return next(err)
    }
    //check if the user Email already exist in the databse  
        const emailExist = await User.findOne({email: req.body.email})
        if (emailExist){
          return next(createCustomError('Email already already, signup with gmail account', 401))
        }
        const newUser = await User.create({...req.body})
        //create jwt token
        const token = await newUser.jwtToken()
        //handle email verification
        sendVerificationEmail(newUser, res)
        res.status(200).json({
        message: "User created successfully",
        status: "Success",
        data:{
          user: newUser.username,
          userToken: token
        }
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
        //generate jwt token
        const token = await emailExist.jwtToken()
        sendOTPVericationMail(newUser,res)
        //handle email verification
        sendVerificationEmail(newUser, res)
        res.status(200).json({
        message: "User login successfully",
        status: "Success",
        data:{
          user: emailExist.username,
          userToken: token
        }
      })
  })

  // get user email link
  static getUserEmailLink = trycatchHandler(async (req, res, next ) => {
    const {userId, uniqueString} = req.params
      //get the user verication mail ID
      const userExist = await UserVerification.find({userId})
      //valid userId
      if(userExist.length > 0){
        const {expiresAt} = userExist[0];
        //compare if the uniques is valid
        const hashedUniqueString = userExist[0].uniqueString;
        //check for expires time
        if (expiresAt < Date.now()){
          //user verification does not exist
          const deleteMail = await UserVerification.deleteOne({userId})
          if (!deleteMail){
            throw new BadRequestError("Clearing user data failed")
          }else{
            const deleteUser = await User.deleteOne({_id: userId})
            if(!deleteUser){
              throw new BadRequestError("Deleting user fail")
            }else{
              res.status(200).json({message:"user successfully deleted"})
            }
          }
        }else{
            //valid user exist
            //uniques string from params and hashed string fromdatabase
            const validUser = await bcrypt.compare(uniqueString, hashedUniqueString)
            if(!validUser){
              throw new UnauthorizedError("Invalid verification passed")
            }else{
              //update user model by changing the verified
              const verifiedUser = await User.updateOne({_id:userId},{verified: true})
              if(!verifiedUser){
                throw new BadRequestError("Failed to update user")
              }else{
                //delete verification model
                await UserVerification.deleteOne({userId})
                //send a html message to the user
                res.render('verifiedMail')
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
    const {userId, email} = req.body
    const delAlreadyMail = await UserVerification.deleteMany({userId})
    if(!delAlreadyMail){
      throw new BadRequestError("Verification resend error")
    }
    sendVerificationEmail({_id:userId, email},res)
  })

  
  //verify OTP Email
  static verifyOTP = trycatchHandler(async(req,res,next) => {
    const {userId, otp} = req.body
    //check if the user OTP exists
    const userOTPverifyID = await OTPVerification.find({userId})
    if (!userOTPverifyID){
      throw new UnauthorizedError("Account is invalid or has been valid already")
    }
    //check if the otp has not expired
    const {expiresAt} = userOTPverifyID
    const hashedOTP = userOTPverifyID.otp
    if (expiresAt < Date.now()){
      // otp has expired, delete from the record
      await OTPVerification.deleteMany({userId})
      throw new UnauthorizedError("OTP has expired, please request again")
    }
    //hash valid otp
    const isMatch = await bcrypt.compare(otp, hashedOTP)
    
    if(!isMatch){
      throw new UnauthorizedError("Invalid code passed, check again")
    }
    //update valid otp user
    const updateUser = await User.updateOne({_id:userId},{verified: true})
    await OTPVerification.deleteMany({userId})
    res.status(201).json({
      status:"Success",
      message:"User email verified successfully"
    })
  })
//resed otp, if it has expired
static resendOTPVerification = trycatchHandler(async(req,res,next) => {
  const {userId, email } = req.body
  // delete otp in record
  const otpDel = await OTPVerification.deleteMany({userId})
  if(!otpDel){
    throw new BadRequestError("Please resend error occured")
  }
  //send otp to email
  sendOTPVericationMail({_id:userId,email}, res)
  res.status(201).json({
    status:"Success",
    message:"Check your mail for new code"
  })
 })


  //request password reset link
  static requestPasswordReset = trycatchHandler(async(req,res,next) => {
    const {email, redirectUrl} = req.body
    //check if email exist
    const emailExist = await User.findOne({email})
    if(!emailExist){
      throw new UnauthorizedError("Invalid email account, please check your email")
    }
    //check if the email is verified
    if(!emailExist.verified){
      throw new BadRequestError("The link send to your email is not verified")
    }
    //send a password request url,if verified valid account is found
    sendResetEmail(emailExist, redirectUrl,res)
  })

  //reset password
  static resetPassword = trycatchHandler(async(req,res,next) => {
    const {userId, resetString, newPassword} = req.body
    //check if the user exist in db
    const foundResetLink = await PasswordReset.find({userId});
    if (!foundResetLink){
      throw new UnauthorizedError("Checking for exist password reset failed")
    }
    //check if the found reset has not expired
    const {expiresAt} = foundResetLink
    console.log(expiresAt)
    if (expiresAt < Date.now()){
      await PasswordReset.deleteOne({userId})
      throw new UnauthorizedError("Sorry, your link has expired, press reset button to genearte new one")
    } 
    //reset password record still valid
    const isMatch = await bcrypt.compare(resetString, PasswordReset.resetString)
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
    const deleteOld = await PasswordReset.deleteOne({userId})
    if (!deleteOld){
      throw new BadRequestError("Error occurred while updating password, try again later")
    }
    //password updating successfull
    return res.status(201).json({msg:"Password update successful"})
  })

}
 