import jwtAuthentication from "../middlewares/jwtAuthentication.js";


export const verifyTokenAndAuthorization = (req,res,next) => {
    jwtAuthentication(req,res,() => {
        if(req.user._id === req.params.id || req.user.isAdmin){
            next()
        }else{
            res.status(403).json({message:"Access denied"})
        }
    })
}