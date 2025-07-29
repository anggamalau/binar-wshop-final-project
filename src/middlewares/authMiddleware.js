const jwt = require('jsonwebtoken');

const authMiddleware = {
  authenticateToken(req, res, next) {
    try {
      // Get token from cookies or Authorization header
      let token = req.cookies.token;
      
      if (!token) {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
          token = authHeader.substring(7);
        }
      }

      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'Access denied. No token provided.'
        });
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token has expired'
        });
      } else if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Invalid token'
        });
      } else {
        console.error('Auth middleware error:', error);
        return res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }
    }
  },

  // Optional middleware for routes that work with or without authentication
  optionalAuth(req, res, next) {
    try {
      let token = req.cookies.token;
      
      if (!token) {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
          token = authHeader.substring(7);
        }
      }

      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
      }
      
      next();
    } catch (error) {
      // For optional auth, we don't return errors, just continue without user
      next();
    }
  }
};

module.exports = authMiddleware;