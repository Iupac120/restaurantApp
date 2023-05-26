import mongoose from "mongoose";

const UserVerificationSchema = new mongoose.Schema({
    userId: {
      type: String,
    uniqueString: {
      type: String,
    },
    createdAt: {
      type: Date,
    },
    expiresAt:{
      type: Date,
    }
  }
})

export default mongoose.model('UserVerification', UserVerificationSchema)
