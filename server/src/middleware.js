const { verifyToken } = require('./auth');

// Middleware to verify JWT token
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    // Continue without user (anonymous)
    req.user = null;
    return next();
  }

  const token = authHeader.replace('Bearer ', '');
  const decoded = verifyToken(token);

  if (!decoded) {
    // Continue without user (anonymous)
    req.user = null;
    return next();
  }

  req.user = decoded;
  next();
};

// Middleware to require authentication
const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

module.exports = {
  authMiddleware,
  requireAuth
};
