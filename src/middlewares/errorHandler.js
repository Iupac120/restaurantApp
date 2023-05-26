import CustomAPIError from "../errors/customError.js"

export const errorHandler = (err, req, res, next) => {
    if (err instanceof CustomAPIError){
        console.error('apierror')
        return res.status(err.statusCode).json({msg:err.message})
    }
    return res.status(500).send(`Something went wrong, please try again`)
}
