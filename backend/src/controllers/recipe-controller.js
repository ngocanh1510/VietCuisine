import jwt from "jsonwebtoken";
import AccountModel from "../models/Account.js";
import UserModel from "../models/User.js";
import RecipeModel from "../models/Recipe.js";
import mongoose from "mongoose";
import CategoryModel from "../models/Categories.js";
import sendNotification from "../utils/sendNotification.js";
import NotificationModel from "../models/Notification.js";
import RecipeIngredient from "../models/RecipeIngredient.js";
import IngredientModel from "../models/Ingredient.js";

export const getAllRecipes = async (req, res, next) => {
  let recipes;

  try {
    recipes = await RecipeModel.find();
  } catch (err) {
    return console.log(err);
  }

  if (!recipes) {
    return res.status(500).json({ message: "Request Failed" });
  }
  return res.status(200).json({ recipes });
};

export const getRecipesByCategory = async (req, res) =>  {
    try {
      const { categoryId } = req.params;
      // Truy vấn các công thức với categoryId tương ứng
      const recipes = await RecipeModel.find({ categoriesId: categoryId });
      if (recipes.length === 0) {
        return res.status(404).json({
          status: false,
          message: "No recipes found for this category",
        });
      }
  
      return res.status(200).json({
        status: true,
        message: "Recipes fetched successfully",
        recipes,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        status: false,
        message: "Server error",
        error: error.message,
      });
    }
};

// export const addRecipe = async (req, res) => {
//   if (!recipes) {
//     return res.status(500).json({ message: "Request Failed" });
//   }
//   return res.status(200).json({ recipes });
// };

export const getRecipesInHomepage = async (req, res, next) => {
  let recipes;

  try {
    recipes = await RecipeModel.find().limit(8);
  } catch (err) {
    return console.log('err');
  }

  if (!recipes || recipes.length === 0) {
    return res.status(500).json({ message: "Request Failed" });
  }

  return res.status(200).json({ recipes });
};

export const addRecipe = async (req, res) => {
  const {
    title,
    time,
    carbs,
    protein,
    calories,
    fat,
    description,
    category,
    ingredients, // [{ name: "Tôm", quantity: "100g" }]
    steps,
  } = req.body;
  const imageUrl = req.file?.path;
  const userId = req.user?.id;

  // Validate
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ status: false, message: "Invalid Account ID" });
  }

  if (
    !title || title.trim() === "" ||
    !time || !carbs || !protein || !calories || !fat ||
    !description || description.trim() === "" ||
    !Array.isArray(ingredients) || ingredients.length === 0 ||
    !Array.isArray(steps) || steps.length === 0
  ) {
    return res.status(422).json({ message: "Invalid input" });
  }

  try {
    // Tìm danh mục
    const categoryDoc = await CategoryModel.findOne({ name: category.trim() });
    if (!categoryDoc) {
      return res.status(400).json({ error: "Category not found" });
    }

    // Tạo công thức trước
    const newRecipe = new RecipeModel({
      userOwner: userId,
      title,
      time,
      carbs,
      protein,
      calories,
      fat,
      description,
      categoriesId: categoryDoc._id,
      steps,
      image:imageUrl
    });
    await newRecipe.save();

    // Tạo từng dòng RecipeIngredients
    for (const item of ingredients) {
      const ingredientDoc = await IngredientModel.findOne({ name: item.name.trim() });
      if (!ingredientDoc) 
        return res.status(500).json({ message: "ingedient not found", error: err.message });; // bỏ qua nếu không tìm thấy nguyên liệu

  
      await RecipeIngredient.create({
        recipeId: newRecipe._id,
        ingredientId: ingredientDoc._id,
        quantity: item.quantity
      });
    }

    return res.status(201).json({ message: "Recipe added successfully", recipe: newRecipe });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to add recipe", error: err.message });
  }
};

// Lấy danh dách công thức của tôi
export const getCreateRecipes = async (req, res) => {
  const accountId = req.user.id; // Lấy accountId từ middleware xác thực (JWT)

  if (!mongoose.Types.ObjectId.isValid(accountId)) {
    return res.status(400).json({ status: false, message: "Invalid Account ID" });
  }

  try {
    // Tìm user thông qua accountId
    const account = await AccountModel.findById(accountId).populate("user");
    if (!account || !account.user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    const userId = account.user._id; // Lấy userId thực
    const userRecipes = await RecipeModel.find({ userOwner: userId }); // Tìm các công thức của người dùng
    res.status(200).json({ success: true, recipes: userRecipes }); // Đồng bộ tên trả về
  } catch (error) {
    console.error('Lỗi khi lấy công thức:', error);
    res.status(500).json({ success: false, message: 'Lỗi server', error });
  }
};

export const editRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, time, carbs, protein, calories, fat, description, category, ingredients, steps, image } = req.body;

    const categoryDoc = await CategoryModel.findOne({ name: category });
      if (!categoryDoc) {
          return res.status(400).json({ error: "Category not found" });
      }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: false,
        message: 'Invalid Recipe ID'
      });
    }

    const existingRecipe = await RecipeModel.findById(id);
    if (!existingRecipe) {
      return res.status(404).json({
        status: false,
        message: 'Recipe not found'
      });
    }

    if (title && title !== existingRecipe.title) {
      const existingTitle = await RecipeModel.findOne({ title });
      if (existingTitle) {
        return res.status(400).json({
          status: false,
          message: 'Title already in use'
        });
      }
    }

    const updateFields = {};
    if (title) updateFields.title = title;
    if (time) updateFields.time = time;
    if (carbs) updateFields.carbs = carbs;
    if (protein) updateFields.protein = protein;
    if (calories) updateFields.calories = calories;
    if (fat) updateFields.fat = fat;
    if (description) updateFields.description = description;
    if (categoryDoc._id) updateFields.categoriesId = categoryDoc._id;
    if (ingredients) updateFields.ingredients = ingredients;
    if (steps) updateFields.steps = steps;
    if (image) updateFields.image = image;

    const updatedRecipe = await RecipeModel.findByIdAndUpdate(id, updateFields, { new: true });

    return res.status(200).json({
      status: true,
      message: 'Recipe updated successfully',
      data: updatedRecipe
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: 'Failed to update recipe',
      error: error.message
    });
  }
};


export const deleteRecipe = async (req, res) => {
  try {
    const { id } = req.params; // Lấy ID từ tham số trong URL

    // Kiểm tra xem ID có hợp lệ không
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: false,
        message: 'Invalid Recipe ID'
      });
    }

    // Tìm món ăn trong cơ sở dữ liệu bằng ID
    const existingRecipe = await RecipeModel.findById(id);
    if (!existingRecipe) {
      return res.status(404).json({
        status: false,
        message: 'Recipe not found'
      });
    }

    // Xóa món ăn
    await RecipeModel.findByIdAndDelete(id);

    return res.status(200).json({
      status: true,
      message: 'Recipe deleted successfully'
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: 'Failed to delete recipe',
      error: error.message
    });
  }
};

// Like/Unlike Recipe
export const toggleLikeRecipe = async (req, res) => {
  const { id } = req.params; // Recipe ID
  const accountId = req.user.id;

  if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(accountId)) {
    return res.status(400).json({ status: false, message: "Không tồn tại Recipe ID hoặc Account ID" });
  }

  try {
    const account = await AccountModel.findById(accountId).populate("user");
    if (!account || !account.user) {
      return res.status(404).json({ status: false, message: "Không tìm thấy User từ Account ID" });
    }

    const userId = account.user._id; // ID thực của User
    const userName = account.user.name; // Tên của User

    const recipe = await RecipeModel.findById(id);
    if (!recipe) {
      return res.status(404).json({ status: false, message: "Không tìm thấy Recipe" });
    }

    // Kiểm tra trạng thái hiện tại: đã like hay chưa
    const hasLiked = recipe.likes.includes(userId);

    // if (hasLiked) {
    //     // Nếu đã like -> unlike
    //     recipe.likes = recipe.likes.filter((like) => like.toString() !== userId);
    // } else {
    //     // Nếu chưa like -> like
    //     recipe.likes.push(userId);

    //     // Gửi thông báo đến người tạo recipe nếu chưa like
    //     const message = `${userName} đã thích công thức "${recipe.title} của bạn".`;
    //     sendNotification({
    //         recipient: recipe.userOwner,
    //         sender: userId,
    //         type: "like",
    //         recipeId: id,
    //         message
    //     });
    // }
    const updatedRecipe = await RecipeModel.findByIdAndUpdate(
      id,
      hasLiked
        ? { $pull: { likes: userId } } // Unlike: Xóa userId khỏi danh sách likes
        : { $addToSet: { likes: userId } }, // Like: Thêm userId vào danh sách likes
      { new: true } // Trả về tài liệu đã cập nhật
    );

    if (!hasLiked) {
      // Gửi thông báo chỉ khi người dùng nhấn like
      const message = `${userName} đã thích công thức "${recipe.title} của bạn".`;
      sendNotification({
        recipient: recipe.userOwner,
        sender: userId,
        type: "like",
        recipeId: id,
        message,
      });
    }

    await recipe.save();

    res.status(200).json({
      status: true,
      message: hasLiked ? "Recipe unliked" : "Recipe liked",
      updatedRecipe
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: "Failed to toggle like recipe" });
  }
};

// Save/Unsave Recipe
export const toggleSaveRecipe = async (req, res) => {
  const { id } = req.params; // Recipe ID
  const accountId = req.user.id;

  if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(accountId)) {
    return res.status(400).json({ status: false, message: "Không tồn tại Recipe ID hoặc Account ID" });
  }

  try {
    const account = await AccountModel.findById(accountId).populate("user");
    if (!account || !account.user) {
      return res.status(404).json({ status: false, message: "Không tìm thấy User từ Account ID" });
    }

    const userId = account.user._id; // ID thực của User
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ status: false, message: "Không tìm thấy User" });
    }

    const recipe = await RecipeModel.findById(id);
    if (!recipe) {
      return res.status(404).json({ status: false, message: "Không tìm thấy Recipe" });
    }

    // Kiểm tra trạng thái hiện tại: đã save hay chưa
    const hasSaved = user.savedRecipes.includes(id);

    if (hasSaved) {
      // Nếu đã save -> unsave
      user.savedRecipes = user.savedRecipes.filter((recipeId) => recipeId.toString() !== id);
    } else {
      // Nếu chưa save -> save
      user.savedRecipes.push(id);

      // Gửi thông báo đến người tạo recipe nếu chưa save
      const recipe = await RecipeModel.findById(id);
      if (recipe) {
        const message = `${user.name} đã lưu công thức "${recipe.title} của bạn".`;
        sendNotification({
          recipient: recipe.userOwner,
          sender: userId,
          type: "save",
          recipeId: id,
          message
        });
      }
    }

    await user.save();

    res.status(200).json({
      status: true,
      message: hasSaved ? "Đã bỏ lưu công thức" : "Đã lưu công thức",
      savedRecipes: user.savedRecipes
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: "Failed to toggle save recipe" });
  }
};

// Comment 
export const commentOnRecipe = async (req, res) => {
  const { comment } = req.body; // User ID và nội dung comment
  const accountId = req.user.id;
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ status: false, message: "Recipe ID không hợp lệ" });
  }

  if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(accountId)) {
    return res.status(400).json({ status: false, message: "Không tồn tại Recipe ID hoặc Account ID" });
  }

  if (!comment || comment.trim() === "") {
    return res.status(400).json({ status: false, message: "Comment không thể bỏ trống" });
  }

  try {
    const account = await AccountModel.findById(accountId).populate("user");
    if (!account || !account.user) {
      return res.status(404).json({ status: false, message: "Không tìm thấy User từ Account ID" });
    }

    const userId = account.user._id; // ID thực của User
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ status: false, message: "Không tìm thấy User" });
    }

    const recipe = await RecipeModel.findById(id);
    if (!recipe) {
      return res.status(404).json({ status: false, message: "Không tìm thấy recipe" });
    }

    // Thêm comment vào công thức
    const newComment = {
      user: userId,
      content: comment,
      createdAt: new Date()
    };
    recipe.comments.push(newComment);

    await recipe.save();

    // Gửi thông báo đến người tạo công thức
    if (recipe.userOwner.toString() !== userId.toString()) {
      const message = `${account.user.name} đã bình luận về công thức "${recipe.title}" của bạn.`;
      sendNotification({
        recipient: recipe.userOwner,
        sender: account.user._id,
        type: "comment",
        recipeId: id,
        message,
      });
    }

    res.status(201).json({
      status: true,
      message: "Thêm bình luận thành công",
      comments: recipe.comments
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: "Failed to add comment", error: err.message });
  }
};

// Xuất danh sách đã lưu
export const getSavedRecipes = async (req, res) => {
  const accountId = req.user.id; // Lấy accountId từ middleware xác thực (JWT)

  if (!mongoose.Types.ObjectId.isValid(accountId)) {
    return res.status(400).json({ status: false, message: "Invalid Account ID" });
  }

  try {
    // Tìm user thông qua accountId
    const account = await AccountModel.findById(accountId).populate("user");
    if (!account || !account.user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    const userId = account.user._id; // Lấy userId thực
    const user = await UserModel.findById(userId).populate("savedRecipes"); // Lấy các công thức đã lưu
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    // Lấy danh sách công thức đã lưu
    const savedRecipes = user.savedRecipes;

    res.status(200).json({
      status: true,
      savedRecipes,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: "Failed to get saved recipes" });
  }
};

// Delete Comment
export const deleteCommentFromRecipe = async (req, res) => {
  const { id, commentId } = req.params; // Recipe ID và Comment ID
  const accountId = req.user.id;

  if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(accountId)) {
    return res.status(400).json({ status: false, message: "Không tồn tại Recipe ID hoặc Account ID" });
  }


  try {
    const account = await AccountModel.findById(accountId).populate("user");
    if (!account || !account.user) {
      return res.status(404).json({ status: false, message: "Không tìm thấy người dùng" });
    }

    const recipe = await RecipeModel.findById(id);
    if (!recipe) {
      return res.status(404).json({ status: false, message: "Không tìm thấy Recipe" });
    }

    // Kiểm tra comment có tồn tại không
    const comment = recipe.comments.find((c) => c._id.toString() === commentId);
    if (!comment) {
      return res.status(404).json({ status: false, message: "Không tìm thấy bình luận" });
    }

    // Chỉ cho phép xóa nếu là chủ sở hữu recipe hoặc là người đã tạo comment
    if (
      comment.user.toString() !== account.user._id.toString() &&
      recipe.userOwner.toString() !== account.user._id.toString()
    ) {
      return res.status(403).json({ status: false, message: "Bạn không có quyền xóa bình luận này" });
    }

    // Xóa comment
    recipe.comments = recipe.comments.filter(
      (c) => c._id.toString() !== commentId
    );

    await recipe.save();

    res.status(200).json({
      status: true,
      message: "Xóa bình luận thành công",
      comments: recipe.comments
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: "Failed to delete comment", error: err.message });
  }
};

// get Notifications
export const getNotifications = async (req, res) => {
  const accountId = req.user.id;

  if (!mongoose.Types.ObjectId.isValid(accountId)) {
    return res.status(400).json({ status: false, message: "Không tồn tại Account" });
  }

  try {
    const account = await AccountModel.findById(accountId).populate("user");
    if (!account || !account.user) {
      return res.status(404).json({ status: false, message: "Không tìm thấy người dùng" });
    }

    const userId = account.user._id;

    const notifications = await NotificationModel.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .populate("sender", "username") // Lấy thông tin người gửi
      .populate("recipe", "title"); // Lấy thông tin recipe

    res.status(200).json({ status: true, notifications });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: "Failed to get notifications" });
  }
};

// Đánh dấu đã đọc
export const markNotificationAsRead = async (req, res) => {
  const { id } = req.params; // Notification ID
  const accountId = req.user.id;

  if (!mongoose.Types.ObjectId.isValid(accountId)) {
    return res.status(400).json({ status: false, message: "Không tồn tại Account" });
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ status: false, message: "Invalid Notification ID" });
  }

  try {
    const account = await AccountModel.findById(accountId).populate("user");
    if (!account || !account.user) {
      return res.status(404).json({ status: false, message: "Không tìm thấy người dùng" });
    }

    const userId = account.user._id;

    const notification = await NotificationModel.findOne({ _id: id, recipient: userId });

    if (!notification) {
      return res.status(404).json({ status: false, message: "Không tìm thấy thông báo" });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({ status: true, message: "Notification marked as read" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: "Failed to mark notification as read" });
  }}

  export const getIngredientByRecipeId = async (req, res) => {
     try {
    const { recipeId } = req.params;

     const recipeIngredients = await RecipeIngredient.find({
      recipeId: new mongoose.Types.ObjectId(recipeId)}).populate('ingredientId');

    const result = recipeIngredients.map(item => ({
      name: item.ingredientId?.name,
      unit: item.ingredientId?.unit,
      unitPrice: item.ingredientId?.unitPrice,
      imageUrl: item.ingredientId?.imageUrl,
      quantity: item.quantity
    }));

    res.json(result);
    console.log(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server khi lấy nguyên liệu' });
  }
  }