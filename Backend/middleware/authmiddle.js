// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  let token;
  
  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
      
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');
      
      // Get user from database (excluding password)
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'User not found'
        });
      }
      
      next();
    } catch (error) {
      console.error('Auth error:', error);
      return res.status(401).json({
        success: false,
        error: 'Not authorized, token failed'
      });
    }
  }
  
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized, no token'
    });
  }
};

// Admin only middleware
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      error: 'Access denied. Admin privileges required.'
    });
  }
};

// Volunteer only middleware
const volunteerOnly = (req, res, next) => {
  if (req.user && req.user.role === 'volunteer') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      error: 'Access denied. Volunteer only.'
    });
  }
};

// Optional: Check if user is owner or admin
const isOwnerOrAdmin = (req, res, next) => {
  const resourceUserId = req.params.userId || req.body.userId;
  
  if (req.user && (req.user.role === 'admin' || req.user.id === resourceUserId)) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      error: 'Access denied. You can only access your own resources.'
    });
  }
};

module.exports = {
  protect,
  adminOnly,
  volunteerOnly,
  isOwnerOrAdmin
};