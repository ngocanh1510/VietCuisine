import express from 'express';
import { orderIngredients,getMyOrders, payment } from '../controllers/ingredient-order-controller.js';
import authMiddleware from '../middlewares/auth-middlewares.js';
import authorizeRoles from '../middlewares/authorizeRoles.js';
const router = express.Router();

router.post('/', authMiddleware, orderIngredients);
router.get('/my', authMiddleware, getMyOrders);
router.post('/payment',authMiddleware, payment);
export default router;