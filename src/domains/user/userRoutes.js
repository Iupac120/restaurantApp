import express from 'express';
import UserController from "./userControllers.js"
import jwtAuthentication from '../../middlewares/jwtAuthentication.js';
import { verifyTokenAndAdmin } from '../../util/verifyTokenAndAdmin.js';

// Setting up our User router
const router = new express.Router()

// User Creation Route
router.post("/signup", UserController.createUser)
// login router
router.post("/login",UserController.loginUser)
//user profile
router.post("/profile",jwtAuthentication,UserController.profile)
//update profile
router.put("/Profile/:id",jwtAuthentication,UserController.updateProfile)
//link router for email
router.get("/verify/:userId/:uniqueString",UserController.getUserEmailLink)
// error link router for email
router.get("/verified",UserController.getUserEmailMsg)
//request password reset router
router.post("/requestPasswordReset",UserController.requestPasswordReset)
// reset password
router.post("/resetPassword",UserController.resetPassword)
//resend email verification
router.post("/resendVerificationLink",UserController.resendVericationLink)
//otp verification route
router.post("/verifyOTP",UserController.verifyOTP)
//resend otp verification after expiration
router.post("/resendOTPVerification", UserController.resendOTPVerification)
// refresh route
router.post("/refresh", UserController.refresh)
// logout route
router.post("/logout",UserController.logout)
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

