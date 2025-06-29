import express from 'express';
import authMiddleware from "../middlewares/auth-middlewares.js";
import upload from "../middlewares/uploadMiddelware.js"
import {
  createPost,
  getAllPosts,
  getPostById,
  getMyPosts,
  updatePost,
  deletePost
} from '../controllers/post-controller.js';

const router = express.Router();

router.post('/',authMiddleware,upload.single('image'), createPost);
router.get('/',authMiddleware, getAllPosts);
router.get('/my', authMiddleware, getMyPosts);
router.get('/:id',authMiddleware, getPostById);
router.put('/:id', authMiddleware,upload.single('image'),updatePost);
router.delete('/:id',authMiddleware, deletePost);
export default router;
