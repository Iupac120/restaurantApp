import nodemailer from "nodemailer";
import {v4 as uuidv4} from "uuid";
//import UserVerification from "../database/model/UserVerification.js";
//import PasswordReset from "../database/model/PasswordReset.js";
import bcrypt from "bcrypt"
//import OTPVerification from "../database/model/OTPVerification.js";
import User from "../domains/user/UserModel.js";
import {randomOtp, randomString} from "./randomString.js";

let transporter = await nodemailer.createTransport({
    service:"gmail",
    auth:{
      user:'iupac120@gmail.com',
      pass:'sdnyevcyrvzptlhd'
    }
  })
transporter.verify((err,success) => {
    if(err){
      console.log(err)
      console.log("error in transporter")
    }else{
      console.log('success')
    }
})
//url
const currenturl = "http://localhost:3000";

 
//send email verified link
export default  async function sendVerificationEmail({_id, email, emailVerificationToken}, res) {
  //unique string
  const uniqueString = emailVerificationToken
    //mail content
    let mailOptions = {
        from: process.env.AUTH_EMAIL,
        to: email,
        subject: "verify your Email",
        html:`<p>Verify your Email account to complete your signup and login.</p>
                <p>This link expires in 3 hours</p><p>Press <a href=${currenturl+"/user/verify/"+_id+"/"+uniqueString}> here  </a>to proceed</p>`
    }
    try{
        const mailer = await transporter.sendMail(mailOptions)
        console.log(transporter.sendMail(mailOptions),"mail successfully sent")
    }catch(err){
        //failed to send mail message
        console.log(err)
        return res.status(500).json({msg:"mailing failed"})
    }
}


//send password reset email
export  const sendResetEmail = async({_id,email},redirectUrl,res) => {
  //generate a random string
  const resetString = randomString()
  //delete all existing password reset record
  const clearDatabase = await User.findOneAndUpdate({_id},{
    passwordResetToken: undefined,
    resetPasswordCreatedAt: undefined,
    resetPasswordExpires: undefined
  })
  await clearDatabase.save()
  if (!clearDatabase){
    return res.status(401).json("Try again later")
  }
  //delete record send successfully
  //Now send the email
  // mail message
  const mailOptions = {
    from:"iupac120@gmail.com",
    to:email,//should a dynamic html for multiple messages
    subject:"Password Reset",
    html:`<p>We heard that you lost your password.</p><p>Don't worry, use the below link to reset it.</p>
            <p>This link <b> expires in 30 minutes <b>. <p>Press <a href=${redirectUrl +"/"+_id+"/"+resetString}> here </a> to procced.</p></p>`
  };
  //hash the reset string
  const salt = await bcrypt.genSalt(10);
  const hashedString = await bcrypt.hash(resetString, salt)
  //generate a new string to database
  // const newPasswordReset = await new PasswordReset({
  //   userId:_id,
  //   resetString:hashedString,
  //   createdAt:Date.now(),
  //   expiresAt:Date.now() + 1800000
  // })
  const newPasswordReset = new User({
    passwordResetToken: hashedString,
    resetPasswordCreatedAt: Date.now(),
    resetPasswordExpires:Date.now() + 1800000
})
  const newResetLink = await newPasswordReset.save()
  if (!newResetLink){
    return res.status(401).json("Please again later")
  }
  const mailer = transporter.sendMail(mailOptions)
  if (!mailer){
    return res.status(401).json({msg:"Failed to send email"})
  }
  //email sent successfully
  return res.status(201).json({message:"Email sent successfully"})
}

export const sendOTPVericationMail = async({_id,email},otp,res) => {
  try {
    const mailOptions = {
      from:"iupac120@gmail.com",
      to:email,//should a dynamic html for multiple messages
      subject:"Password Reset",
      html:`<p> Please enter ${otp} to verify your email and complete the sign in.</p>
              <p>This code <b> expires in 30 minutes <b>. <p>`
    };
  
    //send otp to the email
    await transporter.sendMail(mailOptions)

  } catch (err) {
    res.status(401).json({
      status:"Failed",
      message:"OTP passcode failed"
    })
  }
}