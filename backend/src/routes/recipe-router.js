import express from "express";
import authMiddleware from "../middlewares/auth-middlewares.js";
import { getAllRecipes, getRecipesInHomepage,addRecipe,editRecipe,deleteRecipe, toggleLikeRecipe,getSavedRecipes, toggleSaveRecipe, commentOnRecipe, deleteCommentFromRecipe, getNotifications, markNotificationAsRead, getRecipesByCategory,getCreateRecipes} from '../controllers/recipe-controller.js'


const RecipeRouter = express.Router();
    RecipeRouter.get("/",getRecipesInHomepage);
    RecipeRouter.get("/category/:categoryId",getRecipesByCategory);
    RecipeRouter.get("/all",getAllRecipes);
    RecipeRouter.get("/savedRecipes",authMiddleware,getSavedRecipes)
    RecipeRouter.post("/add",authMiddleware,addRecipe);
    RecipeRouter.get("/my",authMiddleware,getCreateRecipes)
    RecipeRouter.put("/:id",editRecipe);
    RecipeRouter.delete("/:id",deleteRecipe);
    RecipeRouter.post('/:id/toggle-like', authMiddleware, toggleLikeRecipe);
    RecipeRouter.post('/:id/toggle-save', authMiddleware, toggleSaveRecipe);
    RecipeRouter.post('/:id/comments', authMiddleware, commentOnRecipe);
    RecipeRouter.delete('/:id/comments/:commentId', authMiddleware, deleteCommentFromRecipe);
    RecipeRouter.get('/notifications/:userId', authMiddleware, getNotifications);
    RecipeRouter.patch('/notifications/:id', authMiddleware, markNotificationAsRead);

export default RecipeRouter;
