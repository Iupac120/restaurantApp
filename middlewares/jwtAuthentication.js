import User from "../database/model/UserModel.mjs";
import jwt from "jsonwebtoken";
import UnauthorizedError from "../errors/unAuthorizedError.js";

export default auth = (req,res,next) => {
    //check headers
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer')){
        throw new UnauthorizedError("Invalid credential")
    }
    //if header is valid
    const token = authHeader.split(' ')[1]
    try {
        //VERIFY jwt credential
        const payload = jwt.verify(token,process.env.ACCESS_TOKEN)
        req.user = {jwtId: payload._id, name:payload.name}
        next()
    } catch (error) {
        throw new UnauthorizedError("Failed credential verfication")
    }
} 