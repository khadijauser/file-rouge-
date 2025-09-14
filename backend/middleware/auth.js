const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false,
        error: 'No token provided',
        code: 'AUTH_REQUIRED'
      });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'yoursecret');
    req.user = decoded;
    next();
    
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        error: 'Session expired',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    res.status(401).json({ 
      success: false, 
      error: 'Invalid authentication',
      code: 'AUTH_ERROR'
    });
  }
};