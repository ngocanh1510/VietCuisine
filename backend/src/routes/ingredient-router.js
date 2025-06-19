import express from "express";
import { addIngredient, getAllIngredient, updateIngredient,deleteIngredient, searchIngredient } from "../controllers/ingredient-controller.js";
import authMiddleware from "../middlewares/auth-middlewares.js";
import upload from "../middlewares/uploadMiddelware.js";
import authorizeRoles from "../middlewares/authorizeRoles.js";

const IngredientRouter = express.Router();
    IngredientRouter.get("/all",getAllIngredient);
    IngredientRouter.post("/add",authMiddleware,authorizeRoles('admin'),upload.single('image'),addIngredient);
    IngredientRouter.put("/:id",authMiddleware,authorizeRoles('admin'),upload.single('image'),updateIngredient);
    IngredientRouter.delete("/:id",authMiddleware,authorizeRoles('admin'), deleteIngredient);
    IngredientRouter.get("/search",searchIngredient)
export default IngredientRouter;
