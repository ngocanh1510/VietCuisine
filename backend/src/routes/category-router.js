import express from "express";
import { getAllCategories } from "../controllers/category-controller.js";


const CategoryRouter = express.Router();
    CategoryRouter.get("/all",getAllCategories);
    
export default CategoryRouter;
