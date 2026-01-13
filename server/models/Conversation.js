const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  // Optional metadata for tracking actions
  metadata: {
    type: Object,
    default: {}
  }
}, {
  _id: false
});

const conversationSchema = new mongoose.Schema({
  // Optional user reference - null for guest users
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  // Session ID for guest users
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  messages: [messageSchema],
  // Track conversation metadata
  context: {
    isAuthenticated: {
      type: Boolean,
      default: false
    },
    lastActivity: {
      type: Date,
      default: Date.now
    },
    // Store relevant context for RAG
    relevantProducts: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    }],
    cartInteraction: {
      type: Boolean,
      default: false
    },
    orderInteraction: {
      type: Boolean,
      default: false
    }
  },
  // Conversation summary for long conversations
  summary: {
    type: String,
    default: ''
  },
  // Track if conversation is active or archived
  status: {
    type: String,
    enum: ['active', 'archived', 'ended'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Index for efficient querying
conversationSchema.index({ userId: 1, status: 1 });
conversationSchema.index({ sessionId: 1, status: 1 });
conversationSchema.index({ 'context.lastActivity': 1 });

// Method to add a message
conversationSchema.methods.addMessage = function(role, content, metadata = {}) {
  this.messages.push({ role, content, metadata });
  this.context.lastActivity = new Date();
  return this.save();
};

// Method to get recent messages for context window
conversationSchema.methods.getRecentMessages = function(limit = 10) {
  return this.messages.slice(-limit);
};

// Static method to cleanup old conversations
conversationSchema.statics.cleanupOldConversations = async function(daysOld = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  
  return this.updateMany(
    {
      'context.lastActivity': { $lt: cutoffDate },
      status: 'active'
    },
    {
      status: 'archived'
    }
  );
};

module.exports = mongoose.model('Conversation', conversationSchema);
