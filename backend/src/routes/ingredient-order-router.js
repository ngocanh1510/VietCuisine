import express from 'express';
import { orderIngredients } from '../controllers/ingredient-order-controller.js';
import authMiddleware from '../middlewares/auth-middlewares.js';

const router = express.Router();

// Đặt nguyên liệu (có xác thực token)
router.post('/', authMiddleware, orderIngredients);

export default router;