import dotenv from "dotenv"
dotenv.config()
import nodemailer from "nodemailer";


let transporter = await nodemailer.createTransport({
    service:process.env.NODEMAILER_HOST,
    auth:{
      user:process.env.NODEMAILER_EMAIL,
      pass:process.env.NODEMAILER_PASS
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
export default  async function sendVerificationEmail({_id, email},uniqueString,res) {
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
export  const sendResetEmail = async({_id,email},resetString,res) => {
  //Now send the email
  // mail message
  const mailOptions = {
    from:"iupac120@gmail.com",
    to:email,//should a dynamic html for multiple messages
    subject:"Password Reset",
    html:`<p>We heard that you lost your password.</p><p>Don't worry, use the below link to reset it.</p>
            <p>This link <b> expires in 30 minutes <b>. <p>Press <a href=${currenturl +"/"+_id+"/"+resetString}> here </a> to procced.</p></p>`
  };

  const mailer = transporter.sendMail(mailOptions)
  if (!mailer){
    return res.status(401).json({msg:"Failed to send email"})
  }

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