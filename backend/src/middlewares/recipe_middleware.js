import RecipeModel from "../models/Recipe";

RecipeModel.pre('save', function (next) {
  this.updated_at = Date.now();
  next();
});