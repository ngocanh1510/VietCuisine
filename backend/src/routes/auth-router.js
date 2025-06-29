import express from 'express'
import { register, login, logout, getProfile, forgotPassword, verifyOTP, resetPassword, updateProfile } from "../controllers/auth-controller.js";
import authMiddleware from '../middlewares/auth-middlewares.js';
import loginLimiter from '../middlewares/rate-limit-middleware.js';

const AccountRouter = express.Router();

AccountRouter.post('/register', register); // Đăng ký tài khoản
AccountRouter.post('/login', login); // // Route đăng nhập (áp dụng giới hạn đăng nhập)
AccountRouter.get('/profile', authMiddleware, getProfile)
AccountRouter.post('/logout',authMiddleware, logout);
AccountRouter.post('/forgot-password', forgotPassword);
AccountRouter.post('/verify-otp', verifyOTP );
AccountRouter.post('/reset-password', resetPassword);
AccountRouter.put('/update-profile', authMiddleware, updateProfile);

export default AccountRouter;