module.exports = (...allowedRoles) => (req, res, next) => {
  if (!req.user?.role || !allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ 
      success: false,
      error: 'Insufficient permissions',
      code: 'FORBIDDEN'
    });
  }
  next();
};