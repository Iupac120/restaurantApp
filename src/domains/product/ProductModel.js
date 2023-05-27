import mongoose from "mongoose";
const Schema = mongoose.Schema

const categorySchema = new Schema({
    name:{
        type: String,
        required:[true,'Please provide a name']
    }
})

const productSchema = new Schema({
    name:{
        type: String,
        required:true
    },
    adjective:{
        type: String,
        required:true
    },
    description:{
        type: String,
        required:true
    },
    price:{
        type: String,
        required:true
    },
    category:{
        type: String,
        required:true,
    },
    imageUrl:{
        type:String,
        required: true
    }
})

export default mongoose.model("Product",productSchema)