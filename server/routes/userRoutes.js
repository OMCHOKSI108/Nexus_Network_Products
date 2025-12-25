const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { generateToken } = require("../utils/generateToken");
const authenticateToken = require("../middleware/auth");
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Email and password validators
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePassword = (password) => password && password.length >= 6;

// ✅ REGISTER (no hashing)
router.post("/register", async (req, res) => {
  try {
    const { name, username, email, password } = req.body;
    const finalUsername = name || username;
    const normalizedEmail = email?.toLowerCase().trim();

    if (!finalUsername || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    if (!validateEmail(normalizedEmail)) {
      return res.status(400).json({ success: false, message: "Invalid email address" });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists with this email" });
    }

    const user = new User({
      username: finalUsername.trim(),
      email: normalizedEmail,
      password, // will be hashed by model pre-save hook
    });

    try {
      await user.save();
    } catch (err) {
      if (err.name === "ValidationError" && err.errors) {
        if (err.errors.email) {
          return res.status(400).json({ success: false, message: err.errors.email.message });
        }
        if (err.errors.username) {
          return res.status(400).json({ success: false, message: err.errors.username.message });
        }
      }
      throw err;
    }

    const token = generateToken(user._id);
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("⚠️ Registration error:", error);
    res.status(500).json({ success: false, message: "Server error during registration" });
  }
});

// ✅ LOGIN (no password hashing)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email?.toLowerCase().trim();

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    if (!validateEmail(normalizedEmail)) {
      return res.status(400).json({ success: false, message: "Invalid email format" });
    }

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const isValid = await user.comparePassword(password);
    if (!isValid) {
      return res.status(401).json({ success: false, message: "Invalid password" });
    }

    const token = generateToken(user._id);
    await user.updateLastLogin();

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        lastLogin: user.lastLogin,
      },
    });
  } catch (error) {
    console.error("⚠️ Login error:", error);
    res.status(500).json({ success: false, message: "Server error during login" });
  }
});

// ✅ PROFILE (Protected)
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        username: req.user.username,
        name: req.user.name || req.user.username,
        profileImage: req.user.profileImage || '',
        phone: req.user.phone || '',
        address: req.user.address || {},
        email: req.user.email,
        createdAt: req.user.createdAt,
        updatedAt: req.user.updatedAt,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Update profile (name, phone, address)
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, phone, address, company, gstNumber, dob, secondaryPhone, socialLinks, email } = req.body;
    const user = req.user;
    // Allow email change with validation and uniqueness check
    if (email && email !== user.email) {
      const normalizedEmail = String(email).toLowerCase().trim();
      if (!validateEmail(normalizedEmail)) {
        return res.status(400).json({ success: false, message: 'Invalid email address' });
      }
      const exists = await User.findOne({ email: normalizedEmail });
      if (exists && String(exists._id) !== String(user._id)) {
        return res.status(400).json({ success: false, message: 'Email already in use' });
      }
      user.email = normalizedEmail;
    }
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (company) user.company = company;
    if (gstNumber) user.gstNumber = gstNumber;
    if (dob) user.dob = new Date(dob);
    if (secondaryPhone) user.secondaryPhone = secondaryPhone;
    if (socialLinks) user.socialLinks = socialLinks;
    if (address && typeof address === 'object') {
      user.address = { ...user.address, ...address };
    }
    await user.save();
    // Return sanitized user object
    const safeUser = {
      id: user._id,
      username: user.username,
      name: user.name,
      email: user.email,
      phone: user.phone,
      profileImage: user.profileImage || '',
      address: user.address || {},
      company: user.company || '',
      gstNumber: user.gstNumber || '',
      secondaryPhone: user.secondaryPhone || '',
      socialLinks: user.socialLinks || {}
    };
    return res.status(200).json({ success: true, user: safeUser });
  } catch (err) {
    console.error('Update profile error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
});

// Profile image upload (multipart)
const uploadDir = path.join(__dirname, '..', 'uploads', 'profiles');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.random().toString(36).slice(2,8)}${ext}`;
    cb(null, name);
  }
});
const upload = multer({ storage });

router.post('/profile-image', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const urlPath = `/uploads/profiles/${req.file.filename}`;
    // Save to user
    req.user.profileImage = urlPath;
    await req.user.save();
    return res.status(200).json({ success: true, profileImage: urlPath });
  } catch (err) {
    console.error('Upload profile image error:', err);
    return res.status(500).json({ success: false, message: 'Failed to upload image' });
  }
});

// Password reset - request OTP
router.post('/reset-password/request', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const ttl = parseInt(process.env.OTP_TTL_SECONDS || '300', 10);
    user.resetOtp = otp;
    user.resetOtpExpires = new Date(Date.now() + ttl * 1000);
    await user.save();
    const { sendPasswordResetOtp } = require('../config/email');
    try {
      await sendPasswordResetOtp(user.email, otp);
    } catch (e) {
      console.warn('Failed sending reset OTP email:', e.message || e);
    }
    return res.json({ success: true, message: 'OTP sent if email exists' });
  } catch (err) {
    console.error('Reset password request error:', err);
    return res.status(500).json({ success: false, message: 'Internal error' });
  }
});

// Password reset - verify OTP and set new password
router.post('/reset-password/verify', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) return res.status(400).json({ success: false, message: 'Email, OTP and newPassword are required' });
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (!user.resetOtp || !user.resetOtpExpires) return res.status(400).json({ success: false, message: 'No reset request found' });
    if (new Date() > new Date(user.resetOtpExpires)) return res.status(400).json({ success: false, message: 'OTP expired' });
    if (String(user.resetOtp) !== String(otp)) return res.status(400).json({ success: false, message: 'Invalid OTP' });
    user.password = newPassword;
    user.resetOtp = undefined;
    user.resetOtpExpires = undefined;
    await user.save();
    return res.json({ success: true, message: 'Password reset successful' });
  } catch (err) {
    console.error('Reset password verify error:', err);
    return res.status(500).json({ success: false, message: 'Internal error' });
  }
});

module.exports = router;
