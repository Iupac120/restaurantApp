import express from 'express';
import UserController from '../controllers/userController.js'

// Setting up our User router
const router = new express.Router()

// User Creation Route
router.post("/signup", UserController.createUser)
// login router
router.post("/login",UserController.loginUser)
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
//Exporting the User Router
export { router }

// export const obj = { name: "james" }

// export function callName(){
//   console.log("Calling ", obj.name)
// }

