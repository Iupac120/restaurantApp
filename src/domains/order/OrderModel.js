import mongoose from "mongoose";
const Schema = mongoose.Schema

const orderSchema = new Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        red:"User"
    },
    orderItems:{
        name:{type:String, required: true},
        amount:{type:String, required: true},
        imageUrl:{type:String, required: true},
        price:{type:String, required: true},
        product:{
            type:String, 
            required: true,
            ref:"Product"
        }
    },
    shippingAddress:{
        address:{type:String, required: true},
        city:{type:String, required: true},
        postalCode:{type:String, required: true},
        Country:{type:String, required: true}
    },
    paymentMethod:{
        type:String, 
        required: true
    },
    paymentResult:{
        id:{type:String},
        status:{type:String},
        update_time:{type:String},
        email_address:{type:String},
    },
    taxPrice:{
        type:String,
        required: true,
        default:0.0
    },
    shippingPrice:{
        type:Number,
        required: true,
        default:0.0 
    },
    totalPrice:{
        type:Number,
        required: true,
        default:0.0
    },
    isPaid:{
        type:Boolean,
        required: true,
        default:false
    },
    paidAt:{
        type: Date
    },
    isDelivered:{
        type:Boolean,
        required: true,
        default:false
    },
    deliverdAt:{
        type: Date
    },
    timestamps: true
})

export default mongoose.model("Order", orderSchema)