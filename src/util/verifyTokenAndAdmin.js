import jwtAuthentication from "../middlewares/jwtAuthentication.js";


export const verifyTokenAndAdmin = (req,res,next) => {
    jwtAuthentication(req,res,() => {
        console.log("three")
        if(req.user.isAdmin){
            next()
        }else{
            res.status(403).json({message:"Access denied"})
        }
    })
}