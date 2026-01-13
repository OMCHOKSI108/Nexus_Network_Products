const mongoose = require('mongoose');

const blockedIPSchema = new mongoose.Schema({
  ip: {
    type: String,
    required: true,
    unique: true
  },
  reason: {
    type: String,
    required: true,
    enum: ['MULTIPLE_FAILED_LOGINS', 'SUSPICIOUS_ACTIVITY', 'MANUAL_BLOCK', 'DDOS_ATTEMPT']
  },
  blockedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Can be system-automated
  },
  blockedByEmail: {
    type: String
  },
  notes: {
    type: String
  },
  expiresAt: {
    type: Date,
    required: false // If null, permanent block
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for fast lookups
blockedIPSchema.index({ ip: 1, isActive: 1 });
blockedIPSchema.index({ expiresAt: 1 });

// Static method to check if IP is blocked
blockedIPSchema.statics.isBlocked = async function(ip) {
  const block = await this.findOne({
    ip,
    isActive: true,
    $or: [
      { expiresAt: null },
      { expiresAt: { $gt: new Date() } }
    ]
  });
  
  return !!block;
};

// Static method to block an IP
blockedIPSchema.statics.blockIP = async function(ip, reason, blockedBy, notes, durationHours = null) {
  const expiresAt = durationHours ? new Date(Date.now() + durationHours * 60 * 60 * 1000) : null;
  
  return this.findOneAndUpdate(
    { ip },
    {
      ip,
      reason,
      blockedBy: blockedBy?._id,
      blockedByEmail: blockedBy?.email,
      notes,
      expiresAt,
      isActive: true
    },
    { upsert: true, new: true }
  );
};

// Static method to unblock an IP
blockedIPSchema.statics.unblockIP = async function(ip) {
  return this.updateOne(
    { ip },
    { isActive: false }
  );
};

// Clean up expired blocks periodically
blockedIPSchema.statics.cleanExpired = async function() {
  return this.updateMany(
    {
      expiresAt: { $lte: new Date() },
      isActive: true
    },
    { isActive: false }
  );
};

module.exports = mongoose.model('BlockedIP', blockedIPSchema);
