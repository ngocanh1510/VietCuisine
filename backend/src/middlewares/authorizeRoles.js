export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Bạn không có quyền truy cập chức năng này.' });
    }
    next();
  };
};

 export default authorizeRoles;