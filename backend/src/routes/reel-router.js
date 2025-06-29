import { addReel, deleteReel, getAllReel, updateReel } from "../controllers/reel-controller.js";
import express from "express";
import upload from "../middlewares/uploadMiddelware.js";
import authMiddleware from "../middlewares/auth-middlewares.js";

const ReelRouter = express.Router();
    ReelRouter.get("/all",authMiddleware,getAllReel);
    ReelRouter.post("/add",authMiddleware, upload.single('video'),addReel);
    ReelRouter.put("/:id",authMiddleware,upload.single('video'),updateReel);
    ReelRouter.delete("/:id",authMiddleware,deleteReel);
export default ReelRouter;