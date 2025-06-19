import mongoose from "mongoose";
import AccountModel from "../models/Account.js";
import IngredientModel from "../models/Ingredient.js";


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
    const {name, unit, unitPrice} = req.body;
    const imageUrl = req.file?.path;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ status: false, message: "Invalid Account ID" });
      }

      // Kiểm tra dữ liệu đầu vào
      if (!name || !unit || !unitPrice) {
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
      imageUrl:imageUrl
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
    const {name, unit, unitPrice} = req.body;
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
    const { id } = req.params; // Lấy ID từ tham số trong URL
    const userId = req.user?.id;
    
    const account = await AccountModel.findOne({user: new mongoose.Types.ObjectId(userId)});
    if (!account || account.role !== "admin") {
      return res.status(403).json({ status: false, message: "User cannot edit ingredient" });
    }
    // Kiểm tra xem ID có hợp lệ không
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: false,
        message: 'Invalid ingredient ID'
      });
    }

    // Tìm món ăn trong cơ sở dữ liệu bằng ID
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
