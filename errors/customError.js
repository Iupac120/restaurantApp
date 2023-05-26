
export default class CustomAPIError extends Error{
    constructor(message, statusCode){
        super(message);
        this.statusCode = statusCode
    }
}

export const createCustomError = (message, statusCode) => {
    console.log('custom error')
    return new CustomAPIError(message, statusCode)
}

