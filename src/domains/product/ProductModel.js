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

const restaurantSchema = new Schema({
    restaurant: {
        type: String,
        required: [true, 'Please provide a name']
    },
    food: [{
        name: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        }
    }],
    drink: [{
        name: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        }
    }],
    imageUrl: {
        type: [String],
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'Please provide a name'],
        ref: "User"
    }
});


const productSchema = new Schema({
    name:[restaurantSchema],
    reviews:[reviewSchema],
    numReview:{
        type: Number,
        default: 0
    },
    description:{
        type: String,
        default:"Eating delicious balanced diet"
    },
    rating:{
        type: String,
        default:"3.5"
    },
    discount: {
        type: Number,
        default: 0
      },
    promoAvailable: {
        type: Boolean,
        default: false
      },
    featured:{
        type: Boolean,
        default: false
    }
},{
    timestamps:true
})

productSchema.methods.discountPrice = function(/*discountValue*/){
    const originalPrice = this.name.reduce((total,restaurant) => {
        const restaurantPrice = restaurant.food.reduce((subtotal, foodItem) => {
            return subtotal + foodItem.price
        })
        return total + restaurantPrice
    }, 0)
    const discountAmount = (this.discount/100)*originalPrice
    const discountedPrice = originalPrice - discountAmount
    return parseFloat(discountedPrice.toFixed(2))
    this.discount = discountValue
    return this.save()
}

export default mongoose.model("Product",productSchema)