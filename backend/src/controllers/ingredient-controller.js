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
export const addIngredient = async(req, res, next)=>{
  try{
    const {name, unit, unitPrice, category, stock} = req.body;
    const imageUrl = req.file?.path;

      // Kiểm tra dữ liệu đầu vào
      if (!name || !unit || !unitPrice ||!category ||!stock) {
        return res.status(422).json({ message: "Invalid input" });
      }

    const existingName = await IngredientModel.findOne({ name });
      if (existingName) {
        return res.status(400).json({
          status: false,
          message: 'Name already in use'
        });
      }

    const ingredient = new IngredientModel({
      name:name,
      unitPrice:unitPrice,
      unit:unit,
      imageUrl:imageUrl,
      category:category,
      stock:stock
    })

    await ingredient.save();
    return res.status(201).json({ message: "Ingredient added successfully", recipe: ingredient });
  }
  catch (err) {
    return res.status(500).json({ message: "Failed to add ingredient", error: err.message });
  }
}

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
          index: "unsignedIngredient", // hoặc tên bạn đặt
          text: {
            query: keyword,
            path: "name"
          }
        }
      }
    ]);

    res.status(200).json({ status: true, ingredients: results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: "Search failed", error: err.message });
  }
};

export const updateStockUnified = async (req, res) => {
  try {
    let updates = [];

    // Nếu có file
    if (req.file) {
      const ext = req.file.originalname.split('.').pop().toLowerCase();

      if (ext === 'csv') {
        const rows = [];
        fs.createReadStream(req.file.path)
          .pipe(csv())
          .on('data', (row) => rows.push(row))
          .on('end', async () => {
            fs.unlinkSync(req.file.path);
            await handleStockImport(rows, res); // Gọi xử lý
          });
        return;
      } else if (ext === 'xlsx') {
        const workbook = xlsx.readFile(req.file.path);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        updates = xlsx.utils.sheet_to_json(sheet);
        fs.unlinkSync(req.file.path);
      }
    } else {
      updates = req.body;
    }
    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ status: false, message: "Dữ liệu không hợp lệ" });
    }

    await handleStockImport(updates, res);
  } catch (err) {
    console.error('Lỗi xử lý:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

async function handleStockImport(data, res) {
  try {
    const updatedIngredients = [];
    for (const item of data) {
      const name = item.name?.trim();
      const quantity = item.quantity;
      if (!name || isNaN(quantity)) continue;

      const ingredient = await IngredientModel.findOne({ name });
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
    return res.status(500).json({ message: 'Lỗi khi nhập kho', error: err.message });
  }
}
