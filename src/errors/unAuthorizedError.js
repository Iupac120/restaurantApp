import CustomAPIError from "./customError.js";
export default class UnauthorizedError extends CustomAPIError{
    constructor(message){
        super(message)
        this.statusCode = 401
    }
}