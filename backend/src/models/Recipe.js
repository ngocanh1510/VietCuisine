import mongoose from 'mongoose';
import Category from './Categories.js';
import User from './User.js';

const RecipeSchema = new mongoose.Schema({
    userOwner: {type: mongoose.Types.ObjectId, ref: User},
    title:{type:String,required:true,unique:true},
    time:{type:Number,required:true},
    carbs:{type:Number,required:true},
    protein:{type:Number,required:true},
    calories:{type:Number,required:true},
    fat:{type:Number,required:true},
    description:{type:String,required:true},
    categoriesId:{type:mongoose.Types.ObjectId,ref:Category},
    ingredients:[{
        name: { type: String, required: true },
        quantity: { type: String, required: true },
      }],
    steps:[{
        title: { type: String, required: true },
        description: { type: String, required: true },
      }],
    image:{type:String},
    likes: [{ type: mongoose.Types.ObjectId, ref: 'users' }], // Danh sách người dùng đã like
    comments: [{
        user: { type: mongoose.Types.ObjectId, ref: 'users' },
        content: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
    }],
    saves: [{ type: mongoose.Types.ObjectId, ref: 'users' }], // Danh sách người dùng đã save
},
{
    timestamps:true
})

const RecipeModel=mongoose.model("recipesses", RecipeSchema)
export default RecipeModel



