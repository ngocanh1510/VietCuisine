import mongoose from "mongoose"

const CategorySchema=new mongoose.Schema({
    name:{type:String,required:true},
    imageUrl:{type:String},
})

const CategoryModel=mongoose.model("categories", CategorySchema);
export default CategoryModel