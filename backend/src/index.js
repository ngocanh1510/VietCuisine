import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import AccountRouter from "./routes/auth-router.js";
import CategoryRouter from "./routes/category-router.js";
import RecipeRouter from "./routes/recipe-router.js";
import IngredientRouter from "./routes/ingredient-router.js";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cors());


mongoose.connect(
    `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@cluster0.jlyvr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`)
.then(() => {
    console.log("Kết nối thành công tới MongoDB Atlas!");
  })
  .catch((error) => {
    console.error("Kết nối thất bại tới MongoDB Atlas:", error);
  });
  
app.listen(3001, () => console.log("SERVER STARTED!"));

app.use("/auth", AccountRouter);
app.use("/recipe", RecipeRouter);
app.use("/category",CategoryRouter)
app.use("/ingredient",IngredientRouter);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

