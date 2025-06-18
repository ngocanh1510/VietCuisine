import mongoose from "mongoose";

const AccountSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true, 
        unique: true,
        trim: true
    },
    password: {type: String, require: true},
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users", 
        required: true 
    },
    passwordResetToken: { type: String, default: null },  // Lưu trữ OTP
    passwordResetExpires: { type: Date, default: null },
    isOtpVerified: { type: Boolean, default: false }
});

const AccountModel = mongoose.model("accounts", AccountSchema);

export default AccountModel;