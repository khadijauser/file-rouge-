const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log('Auth header:', authHeader);
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('No valid auth header found');
    return res.status(401).json({ message: 'No token, authorization denied' });
  }
  
  const token = authHeader.split(' ')[1];
  console.log('Token extracted:', token ? 'Token exists' : 'No token');
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'yoursecret');
    console.log('Token decoded successfully:', { id: decoded.id, role: decoded.role, name: decoded.name });
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Token verification failed:', err.message);
    res.status(401).json({ message: 'Token is not valid' });
  }
}; 