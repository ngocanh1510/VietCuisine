import express from 'express';
import { getAllUsers, updateAccountStatus } from '../controllers/user-controller.js';
import authMiddleware from '../middlewares/auth-middlewares.js';
import authorizeRoles  from '../middlewares/authorizeRoles.js';

const router = express.Router();
 
router.get('/users', authMiddleware, authorizeRoles('admin'), getAllUsers);

router.put('/accounts/:id/status', authMiddleware, authorizeRoles('admin'), updateAccountStatus);
export default router;
