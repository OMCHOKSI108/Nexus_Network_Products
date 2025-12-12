const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// Admin authentication middleware
const adminAuth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No admin token provided.'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if it's an admin token
    if (decoded.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    // Get admin from database
    const admin = await Admin.findById(decoded.id).select('-password');
    
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Admin not found.'
      });
    }

    if (!admin.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin account is deactivated.'
      });
    }

    // Add admin to request
    req.admin = admin;
    next();
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Invalid admin token.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      console.log(`🔐 Admin token expired for token issued at: ${new Date(error.expiredAt).toISOString()}`);
      return res.status(401).json({
        success: false,
        message: 'Access denied. Admin token expired. Please login again.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error during authentication.'
    });
  }
};

// Super admin middleware (for sensitive operations)
const superAdminAuth = async (req, res, next) => {
  try {
    // First check admin auth
    await adminAuth(req, res, () => {
      // Check if super admin
      if (req.admin.role !== 'superadmin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Super admin privileges required.'
        });
      }
      next();
    });
  } catch (error) {
    console.error('Super admin auth error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during super admin authentication.'
    });
  }
};

// Optional admin middleware (doesn't block if no token)
const optionalAdminAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Continue without admin
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.userType === 'admin') {
      const admin = await Admin.findById(decoded.id).select('-password');
      if (admin && admin.isActive) {
        req.admin = admin;
      }
    }
    
    next();
  } catch (error) {
    // Ignore errors and continue
    next();
  }
};

module.exports = {
  adminAuth,
  superAdminAuth,
  optionalAdminAuth
};