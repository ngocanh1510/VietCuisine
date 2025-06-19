// routes/postRoutes.js
import express from 'express';
import authMiddleware from "../middlewares/auth-middlewares.js";
import {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost
} from '../controllers/post-controller.js';

import { toggleLike, getLikes } from '../controllers/like-controller.js';
const router = express.Router();

router.post('/',authMiddleware, createPost);
router.get('/', getAllPosts);
router.post('/like', authMiddleware, toggleLike);
router.get('/like', getLikes);
router.get('/:id', getPostById);
router.put('/:id', authMiddleware,updatePost);
router.delete('/:id',authMiddleware, deletePost);
export default router;
