import express from 'express';
import { orderIngredients,getMyOrders, payment, getOrderById } from '../controllers/ingredient-order-controller.js';
import authMiddleware from '../middlewares/auth-middlewares.js';
import authorizeRoles from '../middlewares/authorizeRoles.js';
import IngredientModel from '../models/Ingredient.js';
import IngredientOrder from '../models/IngredientOrder.js';
const router = express.Router();

router.post('/', authMiddleware, orderIngredients);
router.get('/my', authMiddleware, getMyOrders);
router.post('/payment',authMiddleware, payment);
router.get("/:id", getOrderById);

export default router;