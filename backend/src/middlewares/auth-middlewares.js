import jwt from 'jsonwebtoken';
import Account from '../models/Account.js';
// Định nghĩa middleware
const authMiddleware = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; // Lấy token sau "Bearer <token>";
    
    if (!token) {
      return res.status(401).json({ message: "Authorization token is missing" });
    }
  
    try {
      // Thực hiện xác thực token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const account = await Account.findById(decoded.id).populate('user');

      req.user = {
        id: account.user._id,     // userId
        accountId: account._id    // optional
      };
      
      // console.log('req.user:', req.user); 
      next();
    } catch (err) {
      return res.status(401).json({ message: "Invalid token" });
    }
  };
  
  // Xuất middleware
  export default authMiddleware;
  