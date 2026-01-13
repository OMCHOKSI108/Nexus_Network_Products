const mongoose = require('mongoose');

const userActivityLogSchema = new mongoose.Schema({
  // User who performed the action
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  
  // Action performed
  action: {
    type: String,
    required: true,
    enum: [
      // Authentication
      'LOGIN',
      'LOGOUT',
      'FAILED_LOGIN',
      'PASSWORD_RESET_REQUESTED',
      'PASSWORD_RESET_COMPLETED',
      'OTP_VERIFIED',
      
      // Product actions
      'VIEWED_PRODUCT',
      'SEARCHED_PRODUCTS',
      
      // Cart actions
      'ADDED_TO_CART',
      'REMOVED_FROM_CART',
      'UPDATED_CART',
      'CLEARED_CART',
      
      // Order actions
      'PLACED_ORDER',
      'CANCELLED_ORDER',
      'VIEWED_ORDERS',
      
      // Profile actions
      'UPDATED_PROFILE',
      'UPDATED_ADDRESS',
      
      // Chatbot actions
      'CHATBOT_MESSAGE_SENT',
      'CHATBOT_PRODUCT_CLICKED',
      'CHATBOT_ADD_TO_CART'
    ]
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
  device: {
    type: String,
    enum: ['desktop', 'mobile', 'tablet', 'unknown'],
    default: 'unknown'
  },
  browser: {
    type: String
  },
  os: {
    type: String
  },
  
  // Additional context
  metadata: {
    type: Object,
    default: {}
  },
  
  // Location (optional - can be added via IP geolocation)
  location: {
    country: String,
    city: String
  }
}, {
  timestamps: true
});

// Indexes for fast queries
userActivityLogSchema.index({ userId: 1, createdAt: -1 });
userActivityLogSchema.index({ action: 1, createdAt: -1 });
userActivityLogSchema.index({ createdAt: -1 });
userActivityLogSchema.index({ ip: 1 });

// Static method to log user activity
userActivityLogSchema.statics.logActivity = async function(data) {
  try {
    const log = new this(data);
    await log.save();
    return log;
  } catch (error) {
    console.error('Failed to create activity log:', error);
    // Don't throw error - activity logging should not break the main operation
    return null;
  }
};

// Static method to get user activity timeline
userActivityLogSchema.statics.getUserTimeline = async function(userId, limit = 50) {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
};

// Static method to detect suspicious activity
userActivityLogSchema.statics.getSuspiciousActivity = async function(userId, hours = 24) {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);
  
  const failedLogins = await this.countDocuments({
    userId,
    action: 'FAILED_LOGIN',
    createdAt: { $gte: since }
  });
  
  return {
    failedLogins,
    suspicious: failedLogins > 5
  };
};

module.exports = mongoose.model('UserActivityLog', userActivityLogSchema);
