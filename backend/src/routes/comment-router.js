import express from 'express';
import {
  createComment,
  deleteComment,
  getCommentsByTarget
} from '../controllers/comment-controller.js';

import authMiddleware from "../middlewares/auth-middlewares.js";

const router = express.Router();

router.post('/', authMiddleware, createComment);             
router.get('/', getCommentsByTarget);                   
router.delete('/:id', authMiddleware, deleteComment);         
export default router;
