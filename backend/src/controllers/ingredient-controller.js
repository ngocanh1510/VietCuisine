import mongoose from "mongoose";
import AccountModel from "../models/Account.js";
import IngredientModel from "../models/Ingredient.js";
import fs from 'fs';
import csv from 'csv-parser';
import xlsx from 'xlsx';

//Lấy danh sách nguyên liệu
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

//Thêm nguyên liệu
export const addIngredient = async (req, res) => {
  try {
    let updates = [];
    console.log("Received body:", req.body);
    console.log("Received files:", req.files);
    const image = req.files?.path;
   
    updates = Array.isArray(req.body) ? req.body : [req.body];
    console.log("Received updates:", updates);
    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ status: false, message: "Dữ liệu không hợp lệ" });
    }

    const inserted = [];

    for (const item of updates) {
      const name = item.name?.trim();
      const unit = item.unit;
      const unitPrice = item.unitPrice;
      const category = item.category;
      const stock = item.stock;

      if (!name || !unit || !unitPrice || !category || !stock) continue;

      const existing = await IngredientModel.findOne({ name });
      if (existing) continue;

      const ingredient = new IngredientModel({
        name,
        unit,
        unitPrice: Number(unitPrice),
        stock: Number(stock),
        category,
        imageUrl: image?.path || item.imageUrl || "",
      });

      await ingredient.save();
      inserted.push(ingredient);
    }

    return res.status(201).json({
      message: "Thêm nguyên liệu thành công",
      count: inserted.length,
      data: inserted
    });
  } catch (err) {
    console.error("Add ingredient failed:", err);
    return res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};


//Chỉnh sửa thông tin nguyên liệu
export const updateIngredient = async(req, res)=>{
  try{
    const {id} = req.params;
    const {name, unit, unitPrice, category, stock} = req.body;
    const imageUrl = req.file?.path;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          status: false,
          message: 'Invalid ingredient ID'
        });
      }

    const existingIngredient = await IngredientModel.findById(id);
    if (!existingIngredient) {
      return res.status(404).json({
        status: false,
        message: 'Ingredient not found'
      });
    }

    if (name && name !== existingIngredient.name) {
      const existingName = await IngredientModel.findOne({ name });
      if (existingName) {
        return res.status(400).json({
          status: false,
          message: 'Name already in use'
        });
      }
    }

    const updateFields = {};
    if (name) updateFields.name = name;
    if (unitPrice) updateFields.time = unitPrice;
    if (unit) updateFields.carbs = unit;
    if (imageUrl) updateFields.image = imageUrl;
    if(category) updateFields.category = category;
    if(stock) updateFields.category = stock;

    const updatedIngredient = await IngredientModel.findByIdAndUpdate(id, updateFields, { new: true });

    return res.status(200).json({
      status: true,
      message: 'Ingredient updated successfully',
      data: updatedIngredient
    });
  }
  catch (err) {
    return res.status(500).json({ message: "Failed to update ingredient", error: err.message });
  }
}


//Xóa nguyên liệu
export const deleteIngredient = async (req, res) => {
  try {
    const { id } = req.params; 
    const userId = req.user?.id;
    
    const account = await AccountModel.findOne({user: new mongoose.Types.ObjectId(userId)});
    if (!account || account.role !== "admin") {
      return res.status(403).json({ status: false, message: "User cannot edit ingredient" });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: false,
        message: 'Invalid ingredient ID'
      });
    }

    const existingIngredient = await IngredientModel.findById(id);
    if (!existingIngredient) {
      return res.status(404).json({
        status: false,
        message: 'Ingredient not found'
      });
    }

    await IngredientModel.findByIdAndDelete(id);

    return res.status(200).json({
      status: true,
      message: 'Ingredient deleted successfully'
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: 'Failed to delete ingredient',
      error: error.message
    });
  }
};

export const searchIngredient = async (req, res) => {
  const { keyword } = req.query;

  try {
      const results = await IngredientModel.aggregate([
    {
      $search: {
        index: "unsignedIngredient",
        autocomplete: {
          query: keyword,
          path: "name"
        }
      }
    },
    { $limit: 5 }
  ]);


    res.status(200).json({ status: true, ingredients: results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: "Search failed", error: err.message });
  }
};

export const updateStockUnified = async (req, res) => {
  try {
    const data = req.body;
    console.log("Received data:", data);

    // Kiểm tra xem data có phải mảng không
    if (!Array.isArray(data)) {
      return res.status(400).json({ status: false, message: "Dữ liệu phải là mảng JSON" });
    }

    const updatedIngredients = [];

    for (const item of data) {
      const ingredientId = item.ingredientId;
      const quantity = Number(item.quantity);

      if (!ingredientId || isNaN(quantity)) continue;

      const ingredient = await IngredientModel.findById(ingredientId);
      if (!ingredient) continue;

      const newStock = (ingredient.stock || 0) + quantity;

      await IngredientModel.updateOne(
        { _id: ingredient._id },
        { $set: { stock: newStock } }
      );

      const updated = await IngredientModel.findById(ingredient._id);
      updatedIngredients.push(updated);
    }

    return res.status(200).json({
      status: true,
      message: "Nhập kho thành công",
      updatedIngredients,
    });
  } catch (err) {
    console.error("Lỗi nhập kho:", err);
    return res.status(500).json({ message: "Lỗi khi nhập kho", error: err.message });
  }
};
