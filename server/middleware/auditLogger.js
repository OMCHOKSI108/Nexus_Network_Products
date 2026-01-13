const AdminAuditLog = require('../models/AdminAuditLog');

/**
 * Middleware to automatically log admin actions
 * Usage: router.post('/some-route', auditLogger('ACTION_TYPE', 'TARGET_TYPE'), controller)
 */
const auditLogger = (actionType, targetType) => {
  return async (req, res, next) => {
    // Store audit info in request for later use
    req.auditInfo = {
      actionType,
      targetType,
      adminId: req.user?._id,
      adminEmail: req.user?.email,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent')
    };
    
    // Save original res.json to intercept response
    const originalJson = res.json.bind(res);
    
    res.json = function(data) {
      // Log the action after response
      setImmediate(async () => {
        try {
          const success = res.statusCode >= 200 && res.statusCode < 300;
          
          await AdminAuditLog.logAction({
            adminId: req.auditInfo.adminId,
            adminEmail: req.auditInfo.adminEmail,
            actionType: req.auditInfo.actionType,
            targetType: req.auditInfo.targetType,
            targetId: req.auditInfo.targetId || req.params.id,
            targetName: req.auditInfo.targetName,
            ip: req.auditInfo.ip,
            userAgent: req.auditInfo.userAgent,
            metadata: req.auditInfo.metadata || {},
            success,
            errorMessage: success ? null : (data?.message || 'Unknown error')
          });
        } catch (error) {
          console.error('Audit logging failed:', error);
        }
      });
      
      return originalJson(data);
    };
    
    next();
  };
};

/**
 * Helper to set audit metadata
 */
const setAuditMetadata = (req, metadata) => {
  if (req.auditInfo) {
    req.auditInfo.metadata = { ...req.auditInfo.metadata, ...metadata };
  }
};

/**
 * Helper to set audit target info
 */
const setAuditTarget = (req, targetId, targetName) => {
  if (req.auditInfo) {
    req.auditInfo.targetId = targetId;
    req.auditInfo.targetName = targetName;
  }
};

module.exports = {
  auditLogger,
  setAuditMetadata,
  setAuditTarget
};
