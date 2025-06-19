import mongoose from "mongoose";
import AccountModel from "../models/Account.js";
import IngredientModel from "../models/Ingredient.js";

export const getAllIngredient = async (req, res, next) => {
  let ingredients;

  try {
    ingredients = await IngredientModel.find();
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
  const imageUrl = req.file?.path;
  const userId = req.user?.id;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ status: false, message: "Invalid Account ID" });
    }

  const account = await AccountModel.findById(mongoose.Types.ObjectId(userId));
  if(account.role!="admin"){
      return res.status(400).json({ status: false, message: "User cannot add ingredient" });
  }

  if (
    !name || !unit || !unitPrice
  ) {
    return res.status(422).json({ message: "Invalid input" });
  }

  try{
    const ingredient = new IngredientModel({
      name:name,
      unitPrice:unitPrice,
      unit:unit,
      imageUrl:imageUrl
    })

    await ingredient.save();
  }
  catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to add ingredient", error: err.message });
  }
}