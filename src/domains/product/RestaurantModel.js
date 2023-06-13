import mongoose from "mongoose"

const Schema = mongoose.Schema

const restaurantSchema = new Schema({
    name: {
        type: String,
    },
    products: [
      {
            type: mongoose.Schema.Types.ObjectId,
            ref:"Product",
            required: true
    }],
   
},{timestamps: true});
export default mongoose.model("Restaurant",restaurantSchema)
