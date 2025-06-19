import express from 'express';
import authMiddleware from "../middlewares/auth-middlewares.js";
import { getConversations, getMessagesBetweenUsers } from '../controllers/message-controller.js';

const router = express.Router();

router.get('/conversations/:userId',authMiddleware,getConversations);
router.get('/:userId1/:userId2', authMiddleware,getMessagesBetweenUsers);
export default router;