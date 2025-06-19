import express from "express";
import authMiddleware from "../middlewares/auth-middlewares.js";
import upload  from "../middlewares/uploadMiddelware.js";
import { getAllRecipes, getRecipesInHomepage,addRecipe,editRecipe,deleteRecipe, toggleLikeRecipe,getSavedRecipes, toggleSaveRecipe, commentOnRecipe, deleteCommentFromRecipe, getNotifications, markNotificationAsRead, getRecipesByCategory,getCreateRecipes, getIngredientByRecipeId} from '../controllers/recipe-controller.js'


const RecipeRouter = express.Router();
    RecipeRouter.get("/",getRecipesInHomepage);
    RecipeRouter.get("/category/:categoryId",getRecipesByCategory);
    RecipeRouter.get("/all",getAllRecipes);
    RecipeRouter.get("/savedRecipes",authMiddleware,getSavedRecipes)
    RecipeRouter.post("/add",authMiddleware,upload.single('image'),addRecipe);
    RecipeRouter.get("/my",authMiddleware,getCreateRecipes)
    RecipeRouter.put("/:id",authMiddleware,editRecipe);
    RecipeRouter.delete("/:id",authMiddleware,deleteRecipe);
    RecipeRouter.post('/:id/toggle-like', authMiddleware, toggleLikeRecipe);
    RecipeRouter.post('/:id/toggle-save', authMiddleware, toggleSaveRecipe);
    RecipeRouter.post('/:id/comments', authMiddleware, commentOnRecipe);
    RecipeRouter.delete('/:id/comments/:commentId', authMiddleware, deleteCommentFromRecipe);
    RecipeRouter.get('/notifications/:userId', authMiddleware, getNotifications);
    RecipeRouter.patch('/notifications/:id', authMiddleware, markNotificationAsRead);
    RecipeRouter.get('/:recipeId/ingredients', getIngredientByRecipeId);


export default RecipeRouter;
