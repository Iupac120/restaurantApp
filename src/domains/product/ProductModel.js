import mongoose from "mongoose";
const Schema = mongoose.Schema

const reviewSchema = new Schema({
    name:{
        type: String,
        required:[true,'Please provide a name']
    },
    rating:{
        type: String,
        required:true 
    },
    comment:{
        type: String,
        required:[true,'Please provide a comment']
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        required:[true,'Please provide a name'],
        ref:"User"
    }
})

const productSchema = new Schema({
    name:{
        type: String,
        required:true
    },
    price:{
        type: Number,
        required:true
    },
    foodType:{
        type: String,
        required: true
    },
    reviews:[reviewSchema],
    numReview:{
        type: Number,
        default: 0
    },
    description:{
        type: String,
        required:true
    },
    rating:{
        type: String,
        required:true
    },
    discount: {
        type: Number,
        default: 0
      },
    promoAvailable: {
        type: Boolean,
        default: false
      },
    serviceAvailable:{
        type: Boolean,
        default: false
    },
    imageUrl:{
        type: [String],
        required:true,
    },
    category:{
        type:String,
        enum:{
            values: ["Breakfast","Lunch","Dinner"],
            message:'{VALUE} is not supported'
        }
    }
})

export default mongoose.model("Product",productSchema)