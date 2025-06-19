import mongoose from 'mongoose';

const IngredientSchema = new mongoose.Schema({
  name:{type:String,required:true},
  unitPrice:{type:Number,required:true},
  unit:{type:String,required:true},
  imageUrl:{type:String}

});

const IngredientModel = mongoose.model('ingredient', IngredientSchema);
export default IngredientModel
