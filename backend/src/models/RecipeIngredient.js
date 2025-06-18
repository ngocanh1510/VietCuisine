import mongoose from 'mongoose';
import RecipeModel from './Recipe.js';
import Ingredient from './Ingredient.js';

const RecipeIngredientSchema = new mongoose.Schema({
  recipeId: { type: mongoose.Schema.Types.ObjectId, ref: 'recipe', required: true },
  ingredientId: { type: mongoose.Schema.Types.ObjectId, ref: 'ingredient', required: true },
  quantity: { type: String }
});

export default mongoose.model('recipe_ingredient', RecipeIngredientSchema);
