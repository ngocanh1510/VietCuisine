import Ingredient from "../models/Ingredient.js";

export const getAllIngredient = async (req, res, next) => {
  let ingredients;

  try {
    ingredients = await Ingredient.find();
  } catch (err) {
    return console.log(err);
  }

  if (!ingredients) {
    return res.status(500).json({ message: "Request Failed" });
  }
  return res.status(200).json({ ingredients });
};

export const addIngredient = async(req, res, next)=>{
  const {name, unit, unitPrice} = req.body;
  
}