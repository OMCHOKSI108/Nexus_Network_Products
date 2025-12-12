const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { generateToken } = require("../utils/generateToken");
const authenticateToken = require("../middleware/auth");

// Email and password validators
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePassword = (password) => password && password.length >= 6;

// ✅ REGISTER (no hashing)
router.post("/register", async (req, res) => {
  try {
    console.log("📥 Signup Data received:", req.body);
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
      password, // ⚠️ Stored as plain text (for testing/demo only)
    });

    try {
      await user.save();
      console.log("✅ User registered:", user._id);

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
    } catch (err) {
      // Handle Mongoose validation errors for email and username
      if (err.name === "ValidationError" && err.errors) {
        if (err.errors.email) {
          return res.status(400).json({
            success: false,
            message: err.errors.email.message
          });
        }
        if (err.errors.username) {
          return res.status(400).json({
            success: false,
            message: err.errors.username.message
          });
        }
      }
      throw err;
    }
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

    if (user.password !== password) {
      return res.status(401).json({ success: false, message: "Invalid password" });
    }

    const token = generateToken(user._id);
    user.lastLogin = new Date();
    await user.save();

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
        email: req.user.email,
        createdAt: req.user.createdAt,
        updatedAt: req.user.updatedAt,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
