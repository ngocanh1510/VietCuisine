import express from 'express';
import authMiddleware from "../middlewares/auth-middlewares.js";
import { toggleLike, getLikes } from '../controllers/like-controller.js';

const router = express.Router();
router.post('/', authMiddleware, toggleLike);
router.get('/', getLikes);
export default router;