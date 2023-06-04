import User from "../domains/user/UserModel.js";
import jwt from "jsonwebtoken";
import UnauthorizedError from "../errors/unAuthorizedError.js";

export default async function jwtAuthentication(req,res,next) {
    //check headers
    console.log("jwt")
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer')){
        throw new UnauthorizedError("Invalid credential")
    }
    console.log("jwt")
    //if header is valid
    const token = authHeader.split(' ')[1]
    console.log("jwt")
    try {
        //VERIFY jwt credential
        const payload = jwt.verify(token,process.env.ACCESS_TOKEN)
        //req.user = {jwtId: payload._id, name:payload.name}
        console.log("jwt")
        req.user = await User.find({_id: payload.userId}).select("-password")
        console.log("jwt", req.user)
        next()
    } catch (error) {
        throw new UnauthorizedError("Failed credential verfication")
    }
} 
