const mongoose = require('mongoose');

const adminAuditLogSchema = new mongoose.Schema({
  // Admin who performed the action
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  adminEmail: {
    type: String,
    required: true
  },
  
  // Action details
  actionType: {
    type: String,
    required: true,
    enum: [
      // User actions
      'BLOCK_USER',
      'UNBLOCK_USER',
      'DELETE_USER',
      'RESET_USER_PASSWORD',
      'FORCE_LOGOUT_USER',
      'VIEW_USER',
      'EXPORT_USERS',
      
      // Product actions
      'CREATE_PRODUCT',
      'UPDATE_PRODUCT',
      'DELETE_PRODUCT',
      'TOGGLE_PRODUCT',
      'BULK_UPDATE_PRODUCTS',
      
      // Order actions
      'UPDATE_ORDER_STATUS',
      'CANCEL_ORDER',
      'VIEW_ORDER',
      'EXPORT_ORDERS',
      
      // Revenue actions
      'VIEW_REVENUE',
      'EXPORT_REVENUE',
      
      // Chatbot actions
      'VIEW_CONVERSATIONS',
      'DELETE_CONVERSATION',
      
      // Security actions
      'BLOCK_IP',
      'UNBLOCK_IP',
      'INVALIDATE_TOKENS',
      'VIEW_FAILED_LOGINS',
      
      // System actions
      'LOGIN',
      'LOGOUT',
      'VIEW_DASHBOARD'
    ]
  },
  
  // Target of the action
  targetType: {
    type: String,
    enum: ['USER', 'PRODUCT', 'ORDER', 'CONVERSATION', 'IP', 'SYSTEM', 'REVENUE'],
    required: true
  },
  targetId: {
    type: String, // Can be ObjectId or IP address
    required: false
  },
  targetName: {
    type: String, // User email, product name, etc for easy reference
    required: false
  },
  
  // Request details
  ip: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: false
  },
  
  // Additional context
  metadata: {
    type: Object,
    default: {}
  },
  
  // Status
  success: {
    type: Boolean,
    default: true
  },
  errorMessage: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes for fast queries
adminAuditLogSchema.index({ adminId: 1, createdAt: -1 });
adminAuditLogSchema.index({ actionType: 1, createdAt: -1 });
adminAuditLogSchema.index({ targetType: 1, targetId: 1 });
adminAuditLogSchema.index({ createdAt: -1 });

// Static method to log admin action
adminAuditLogSchema.statics.logAction = async function(data) {
  try {
    const log = new this(data);
    await log.save();
    return log;
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Don't throw error - audit logging should not break the main operation
    return null;
  }
};

module.exports = mongoose.model('AdminAuditLog', adminAuditLogSchema);
