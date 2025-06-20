import express from "express";
import { addIngredient, getAllIngredient, updateIngredient,deleteIngredient, searchIngredient, updateStockUnified } from "../controllers/ingredient-controller.js";
import authMiddleware from "../middlewares/auth-middlewares.js";
import upload from "../middlewares/uploadMiddelware.js";
import authorizeRoles from "../middlewares/authorizeRoles.js";
import uploadcsv from "../middlewares/uploadcsv-middleware.js";

const IngredientRouter = express.Router();
    IngredientRouter.get("/all",getAllIngredient);
    IngredientRouter.post("/add",authMiddleware,authorizeRoles('admin'),upload.single('image'),addIngredient);
    IngredientRouter.put("/:id",authMiddleware,authorizeRoles('admin'),upload.single('image'),updateIngredient);
    IngredientRouter.delete("/:id",authMiddleware,authorizeRoles('admin'), deleteIngredient);
    IngredientRouter.get("/search",searchIngredient)
    IngredientRouter.post("/updateStock",authMiddleware,authorizeRoles('admin'), uploadcsv.single("file"), updateStockUnified);
export default IngredientRouter;
