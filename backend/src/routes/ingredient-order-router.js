import express from 'express';
import { orderIngredients,getMyOrders, payment, getOrderById,orderFromCart } from '../controllers/ingredient-order-controller.js';
import authMiddleware from '../middlewares/auth-middlewares.js';

const router = express.Router();

router.post('/', authMiddleware, orderIngredients);
router.get('/my', authMiddleware, getMyOrders);
router.post('/payment',authMiddleware, payment);
router.get("/:id", getOrderById);
router.post('/from-cart',authMiddleware,orderFromCart);

export default router;