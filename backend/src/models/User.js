import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    gender: { type: String, enum: ['Nam', 'Nữ', 'Khác'], required: true },
    phone: { type: String, required: true },
    email:{ type: String, required: true, unique: true},
    avatar:{ 
        type: String, 
        default: 'https://i.pinimg.com/736x/c6/e5/65/c6e56503cfdd87da299f72dc416023d4.jpg'
    },
    savedRecipes: [{ type: mongoose.Types.ObjectId, ref: "recipe" }],
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
})

const UserModel = mongoose.model("users", UserSchema)

export default UserModel;
