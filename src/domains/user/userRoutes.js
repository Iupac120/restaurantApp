import express from 'express';
import UserController from "./userControllers.js"
import jwtAuthentication from '../../middlewares/jwtAuthentication.js';
import { verifyTokenAndAdmin } from '../../util/verifyTokenAndAdmin.js';

// Setting up our User router
//const router = new express.Router()
const router = express.Router()

// User Creation Route
router.post("/signup", UserController.createUser)
// login router
router.post("/login",UserController.loginUser)
//user profile
router.get("/profile",jwtAuthentication,UserController.profile)
//update profile
router.put("/Profile/:userId",jwtAuthentication,UserController.updateProfile)
//link router for email
router.get("/verify/:userId/:uniqueString",UserController.getUserEmailLink)
// error link router for email
router.get("/verified",UserController.getUserEmailMsg)
//request password reset router
router.post("/requestPasswordReset",UserController.requestPasswordReset)
// reset password
router.post("/resetPassword/:userId/:resetString",UserController.resetPassword)
//resend email verification
router.post("/resendVerificationLink",UserController.resendVericationLink)
//otp verification route
router.post("/verify_otp/:userId",UserController.verifyOTP)
//resend otp verification after expiration
router.post("/resend_otp_verification", UserController.resendOTPVerification)
// refresh route
router.get("/refresh", UserController.refresh)
// logout route
router.get("/logout",UserController.logout)
//delete user
router.delete("/profile/:id", jwtAuthentication,UserController.deleteUser)
//admin can find any user
router.get("/find/:id", verifyTokenAndAdmin,UserController.deleteUser)
//admin can find all users
router.get("/find", verifyTokenAndAdmin,UserController.deleteUser)
//Exporting the User Router
export { router }

// export const obj = { name: "james" }

// export function callName(){
//   console.log("Calling ", obj.name)
// }

