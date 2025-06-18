import mongoose from 'mongoose';

const IngredientSchema = new mongoose.Schema({
  name:{type:String,required:true},
  unitPrice:{type:Number,required:true},
  unit:{type:String,required:true},
  imageUrl:{type:String}

});

export default mongoose.model('ingredient', IngredientSchema);
