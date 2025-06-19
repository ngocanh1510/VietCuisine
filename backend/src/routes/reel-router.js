import { getAllReel } from "../controllers/reel-controller";
import express from "express";

const ReelRouter = express.Router();
    ReelRouter.get("/all",getAllReel);

export default ReelRouter;