const UserActivityLog = require('../models/UserActivityLog');

/**
 * Middleware to log user activities
 * Usage: router.post('/cart', activityLogger('ADDED_TO_CART'), controller)
 */
const activityLogger = (action) => {
  return async (req, res, next) => {
    // Store activity info in request
    req.activityInfo = {
      action,
      userId: req.user?._id,
      userEmail: req.user?.email,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent')
    };
    
    // Parse device info from user agent
    const ua = req.activityInfo.userAgent || '';
    let device = 'unknown';
    if (/mobile/i.test(ua)) device = 'mobile';
    else if (/tablet/i.test(ua)) device = 'tablet';
    else if (/desktop|windows|mac|linux/i.test(ua)) device = 'desktop';
    
    req.activityInfo.device = device;
    
    // Save original res.json to intercept response
    const originalJson = res.json.bind(res);
    
    res.json = function(data) {
      // Log the activity after successful response
      setImmediate(async () => {
        try {
          const success = res.statusCode >= 200 && res.statusCode < 300;
          
          if (success && req.activityInfo.userId) {
            await UserActivityLog.logActivity({
              userId: req.activityInfo.userId,
              userEmail: req.activityInfo.userEmail,
              action: req.activityInfo.action,
              ip: req.activityInfo.ip,
              userAgent: req.activityInfo.userAgent,
              device: req.activityInfo.device,
              metadata: req.activityInfo.metadata || {}
            });
          }
        } catch (error) {
          console.error('Activity logging failed:', error);
        }
      });
      
      return originalJson(data);
    };
    
    next();
  };
};

/**
 * Helper to set activity metadata
 */
const setActivityMetadata = (req, metadata) => {
  if (req.activityInfo) {
    req.activityInfo.metadata = { ...req.activityInfo.metadata, ...metadata };
  }
};

module.exports = {
  activityLogger,
  setActivityMetadata
};
