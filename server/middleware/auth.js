const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // Check for token in Authorization header (Bearer token) or x-auth-token
  let token = req.header('x-auth-token');
  
  // Also check Authorization header for Bearer token
  const authHeader = req.header('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }
  
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).json({ message: 'Token is not valid' });
  }
};
