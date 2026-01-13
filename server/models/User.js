const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: function (v) {
          // Allow letters, spaces, and basic punctuation for names
          return /^[a-zA-Z\s\.\-\']+$/.test(v) && v.trim().length >= 2;
        },
        message: props => `Username '${props.value}' is invalid. Only letters, spaces, and basic punctuation are allowed, minimum 2 characters.`
      }
    },
    // Friendly display name (optional, used by frontend)
    name: { type: String, trim: true },
    profileImage: { type: String, default: '' },
    phone: { type: String, trim: true, default: '' },
    secondaryPhone: { type: String, trim: true, default: '' },
    company: { type: String, trim: true, default: '' },
    gstNumber: { type: String, trim: true, default: '' },
    dob: { type: Date },
    address: {
      fullName: { type: String, trim: true, default: '' },
      addressLine1: { type: String, trim: true, default: '' },
      addressLine2: { type: String, trim: true, default: '' },
      city: { type: String, trim: true, default: '' },
      state: { type: String, trim: true, default: '' },
      postalCode: { type: String, trim: true, default: '' },
      country: { type: String, trim: true, default: '' },
      phone: { type: String, trim: true, default: '' }
    },
    socialLinks: { type: Object, default: {} },
    // Password reset OTP
    resetOtp: { type: String },
    resetOtpExpires: { type: Date },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function (v) {
          // Standard email validation - allow any domain
          return /^[a-zA-Z0-9][a-zA-Z0-9._-]*@[a-zA-Z0-9][a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v);
        },
        message: props =>
          `Email '${props.value}' is invalid. Please enter a valid email address.`
      }
    },
    password: { type: String, required: true, minlength: 6 },
    lastLogin: { type: Date, default: null },
    
    // Admin control fields
    isBlocked: { type: Boolean, default: false },
    blockReason: { type: String },
    blockedAt: { type: Date },
    blockedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    
    // User tagging for admin
    tags: [{
      type: String,
      enum: ['VIP', 'BULK_BUYER', 'INACTIVE', 'RISKY', 'NEW']
    }]
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare password helper
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    return isMatch;
  } catch (err) {
    throw err;
  }
};

userSchema.methods.updateLastLogin = async function() {
  this.lastLogin = new Date();
  await this.save();
};

// Hide sensitive fields when converting to JSON
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

// Keep backward compatibility: expose `name` fallback to `username` when needed
userSchema.virtual('displayName').get(function() {
  return this.name || this.username;
});

module.exports = mongoose.model("User", userSchema);
