import mongoose from "mongoose"

const PasswordResetSchema = new mongoose.Schema({
    userId: {
      type: String,
    resetString: {
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
export default mongoose.model('PasswordReset', PasswordResetSchema)