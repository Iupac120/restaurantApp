import CustomAPIError from "../errors/customError.js"

export const errorHandler = (err, req, res, next) => {
    if (err instanceof CustomAPIError){
        console.error('apierror')
        return res.status(err.statusCode).json({
            msg:err.message,
            stack: process.env.NODE_ENV === 'production'? null: err.stack
        })
    }
    return res.status(500).send(`Something went wrong, please try again`)
}
