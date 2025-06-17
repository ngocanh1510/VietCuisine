import mongoose from "mongoose";
import CategoryModel from "../models/Categories.js";

export const getAllCategories = async (req, res, next) => {
    let categories;
  
    try {
      categories = await CategoryModel.find();
    } catch (err) {
      return console.log(err);
    }
  
    if (!categories) {
      return res.status(500).json({ message: "Request Failed" });
    }
    return res.status(200).json({ categories });
  };