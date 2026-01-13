const BlockedIP = require('../models/BlockedIP');

/**
 * Middleware to check if IP is blocked
 */
const checkBlockedIP = async (req, res, next) => {
  try {
    const ip = req.ip || req.connection.remoteAddress;
    
    const isBlocked = await BlockedIP.isBlocked(ip);
    
    if (isBlocked) {
      return res.status(403).json({
        success: false,
        message: 'Your IP address has been blocked. Please contact support.'
      });
    }
    
    next();
  } catch (error) {
    console.error('IP check failed:', error);
    next(); // Don't block on error
  }
};

module.exports = {
  checkBlockedIP
};
