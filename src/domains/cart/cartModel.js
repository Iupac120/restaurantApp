import mongoose from "mongoose";
const Schema = mongoose.Schema

const cartSchema = new Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref:"User"
    },
   products:[
    {
        productId:{
            type: String
        },
        quantity:{
            type: Number,
            default:0
        }
    }
   ],
},{timestamps: true})

export default mongoose.model("Cart", cartSchema)