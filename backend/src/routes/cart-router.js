import express from 'express';
import { addToCart,getCart,updateCartItem,removeCartItem } from '../controllers/cart-controller.js';
import  authMiddleware  from '../middlewares/auth-middlewares.js';

const router = express.Router();

router.post('/', authMiddleware, addToCart);
router.get('/', authMiddleware, getCart);
router.put('/', authMiddleware, updateCartItem);
router.delete('/:ingredientId', authMiddleware, removeCartItem);

export default router;