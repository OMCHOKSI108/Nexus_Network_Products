const express = require('express');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const { adminAuth } = require('../middleware/adminAuth');
const generateToken = require('../utils/generateToken');

const router = express.Router();

// Admin Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find admin by email
    const admin = await Admin.findOne({ email: email.toLowerCase() });
    
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if account is active
    if (!admin.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact system administrator.'
      });
    }

    // Check password
    const isPasswordValid = await admin.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    await admin.updateLastLogin();

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: admin._id, 
        email: admin.email,
        role: admin.role,
        userType: 'admin'
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Log successful login
    console.log(`✅ Admin login successful: ${admin.email} at ${new Date().toISOString()}`);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        lastLogin: admin.lastLogin
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    
    // Handle locked account
    if (error.message.includes('locked')) {
      return res.status(423).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error during login'
    });
  }
});

// Admin Logout
router.post('/logout', adminAuth, async (req, res) => {
  try {
    // Log logout
    console.log(`📝 Admin logout: ${req.admin.email} at ${new Date().toISOString()}`);
    
    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Admin logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during logout'
    });
  }
});

// Get Admin Profile
router.get('/profile', adminAuth, async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id).select('-password');
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    res.json({
      success: true,
      admin: admin
    });
  } catch (error) {
    console.error('Get admin profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Verify Token
router.get('/verify', adminAuth, async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Token is valid',
      admin: {
        id: req.admin._id,
        name: req.admin.name,
        email: req.admin.email,
        role: req.admin.role,
        lastLogin: req.admin.lastLogin
      }
    });
  } catch (error) {
    console.error('Admin token verify error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Change Password
router.put('/change-password', adminAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    // Get admin with password
    const admin = await Admin.findById(req.admin._id);
    
    // Verify current password
    const isCurrentPasswordValid = await admin.comparePassword(currentPassword);
    
    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    admin.password = newPassword;
    await admin.save();

    console.log(`🔐 Admin password changed: ${admin.email} at ${new Date().toISOString()}`);

    res.json({
      success: true,
      message: 'Password updated successfully'
    });

  } catch (error) {
    console.error('Admin change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during password change'
    });
  }
});

module.exports = router;