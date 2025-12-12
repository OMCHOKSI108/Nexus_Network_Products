const mongoose = require("mongoose");

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
    lastLogin: { type: Date, default: null }
  },
  { timestamps: true }
);

// No pre-save hook
// No bcrypt comparison

module.exports = mongoose.model("User", userSchema);
