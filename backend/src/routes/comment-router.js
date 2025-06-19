import express from 'express';
import {
  createComment,
  getCommentsByPost,
  deleteComment
} from '../controllers/comment-controller.js';

import authMiddleware from "../middlewares/auth-middlewares.js";

const router = express.Router();

router.post('/', authMiddleware, createComment);             
router.get('/:postId', getCommentsByPost);                   
router.delete('/:id', authMiddleware, deleteComment);         
export default router;
