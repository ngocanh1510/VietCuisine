import mongoose from 'mongoose';

const IngredientSchema = new mongoose.Schema({
  name:{type:String,required:true},
  unitPrice:{type:Number,required:true},
  unit:{type:String,required:true},
  imageUrl:{type:String},
  category:{type:String, required:true},
  stock:{type:Number, required:true}

});

const IngredientModel = mongoose.model('ingredient', IngredientSchema);
export default IngredientModel
