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
import ReelRouter from "./routes/reel-router.js";
import AdminRouter from "./routes/admin-router.js";
import OrderRouter from "./routes/ingredient-order-router.js";
import LikeRouter from "./routes/like-router.js";
import CartRouter from "./routes/cart-router.js";
import webhookRouter from "./routes/webhook-router.js";
dotenv.config();

const app = express();


const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/webhook",webhookRouter);
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
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use("/ingredient",IngredientRouter)
app.use("/reel",ReelRouter);
app.use("/posts",PostRouter)
app.use("/comment",CommentRouter)
app.use("/like",LikeRouter)
app.use("/messages", MessageRouter);
app.use("/order", OrderRouter);
app.use("/cart",CartRouter);
app.use("/admin", AdminRouter);
// Socket.IO logic
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  //Join room
  socket.on("joinRoom", ({ userId, partnerId }) => {
    const room = [userId, partnerId].sort().join("-");
    socket.join(room);
  });

  socket.on("sendMessage", async ({ senderId, receiverId, text }) => {
  const room = [senderId, receiverId].sort().join("-");

  // Lưu tin nhắn vào DB
  const message = new Message({ senderId, receiverId, text });
  await message.save();

  // Gửi đến tất cả client trong room
  io.to(room).emit("receiveMessage", {
    senderId,
    receiverId,
    text,
    createdAt: message.createdAt
  });
  });

   socket.on("joinOrderRoom", (orderId) => {
    socket.join(orderId);
  });

  socket.on("updateLocation", ({ orderId, lat, lng }) => {
    io.to(orderId).emit("locationUpdate", { lat, lng });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(3001, () => {
  console.log("✅ Socket.IO server running on http://localhost:3001");
});

