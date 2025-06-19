import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import http from "http";
import mongoose from "mongoose";
import { Server } from 'socket.io';
import AccountRouter from "./routes/auth-router.js";
import CategoryRouter from "./routes/category-router.js";
import RecipeRouter from "./routes/recipe-router.js";
import PostRouter from "./routes/post-router.js"
import CommentRouter from "./routes/comment-router.js"
import Message from './models/Message.js';
import MessageRouter from "./routes/message-router.js";
import IngredientRouter from "./routes/ingredient-router.js";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();

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

app.use("/auth", AccountRouter);
app.use("/recipe", RecipeRouter);
app.use("/category",CategoryRouter)
