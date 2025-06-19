import express from "express";
import { getAllIngredient } from "../controllers/ingredient-controller.js";

const IngredientRouter = express.Router();
    IngredientRouter.get("/all",getAllIngredient);
    
export default IngredientRouter;
