const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Conversation = require('../models/Conversation');
const AdminAuditLog = require('../models/AdminAuditLog');
const UserActivityLog = require('../models/UserActivityLog');
const BlockedIP = require('../models/BlockedIP');
const { adminAuth } = require('../middleware/adminAuth');
const { auditLogger, setAuditTarget, setAuditMetadata } = require('../middleware/auditLogger');

/* ===============================================================================
   ADMIN DASHBOARD - Overview & Statistics
   =============================================================================== */

/**
 * GET /api/admin-panel/dashboard/overview
 * Returns complete business snapshot
 */
router.get('/dashboard/overview', adminAuth, auditLogger('VIEW_DASHBOARD', 'SYSTEM'), async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    const lastMonth = new Date(today);
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    // Parallel queries for performance
    const [
      // Revenue
      todayRevenue,
      weekRevenue,
      monthRevenue,
      
      // Orders
      totalOrders,
      todayOrders,
      weekOrders,
      pendingOrders,
      
      // Users
      totalUsers,
      activeUsers,
      newUsersToday,
      blockedUsers,
      
      // Products
      totalProducts,
      activeProducts,
      lowStockProducts,
      outOfStockProducts,
      
      // Security & Activity
      failedLoginsToday,
      blockedIPs,
      
      // Chatbot
      chatConversationsToday,
      
      // Recent activities
      recentOrders,
      recentUsers,
      lowStockProductsList
    ] = await Promise.all([
      // Revenue calculations
      Order.aggregate([
        { $match: { createdAt: { $gte: today, $lt: tomorrow }, status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: lastWeek }, status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: lastMonth }, status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      
      // Orders
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: today, $lt: tomorrow } }),
      Order.countDocuments({ createdAt: { $gte: lastWeek } }),
      Order.countDocuments({ status: 'pending' }),
      
      // Users
      User.countDocuments({ isDeleted: false }),
      User.countDocuments({ isDeleted: false, isBlocked: false }),
      User.countDocuments({ createdAt: { $gte: today, $lt: tomorrow } }),
      User.countDocuments({ isBlocked: true }),
      
      // Products
      Product.countDocuments(),
      Product.countDocuments({ isActive: true }),
      Product.countDocuments({ stockQuantity: { $lte: 10, $gt: 0 } }),
      Product.countDocuments({ stockQuantity: 0 }),
      
      // Security
      UserActivityLog.countDocuments({ action: 'FAILED_LOGIN', createdAt: { $gte: today } }),
      BlockedIP.countDocuments({ isActive: true }),
      
      // Chatbot
      Conversation.countDocuments({ createdAt: { $gte: today } }),
      
      // Recent data
      Order.find().sort({ createdAt: -1 }).limit(5).populate('user', 'name email'),
      User.find({ isDeleted: false }).sort({ createdAt: -1 }).limit(5).select('name email createdAt'),
      Product.find({ stockQuantity: { $lte: 10, $gt: 0 } }).sort({ stockQuantity: 1 }).limit(10).select('name category stockQuantity')
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          revenue: {
            today: todayRevenue[0]?.total || 0,
            week: weekRevenue[0]?.total || 0,
            month: monthRevenue[0]?.total || 0
          },
          orders: {
            total: totalOrders,
            today: todayOrders,
            week: weekOrders,
            pending: pendingOrders
          },
          users: {
            total: totalUsers,
            active: activeUsers,
            newToday: newUsersToday,
            blocked: blockedUsers
          },
          products: {
            total: totalProducts,
            active: activeProducts,
            lowStock: lowStockProducts,
            outOfStock: outOfStockProducts
          },
          security: {
            failedLoginsToday,
            blockedIPs
          },
          chatbot: {
            conversationsToday: chatConversationsToday
          }
        },
        recentOrders,
        recentUsers,
        lowStockProducts: lowStockProductsList
      }
    });
  } catch (error) {
    console.error('Dashboard overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load dashboard data',
      error: error.message
    });
  }
});

/**
 * GET /api/admin-panel/dashboard/charts
 * Returns data for revenue/orders charts
 */
router.get('/dashboard/charts', adminAuth, async (req, res) => {
  try {
    const { period = '7d' } = req.query; // 7d, 30d, 90d, 1y
    
    let daysBack = 7;
    if (period === '30d') daysBack = 30;
    else if (period === '90d') daysBack = 90;
    else if (period === '1y') daysBack = 365;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);
    startDate.setHours(0, 0, 0, 0);
    
    // Daily revenue and orders
    const dailyStatsRaw = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Transform data to have 'date' field instead of '_id'
    const dailyStats = dailyStatsRaw.map(item => ({
      date: item._id,
      revenue: item.revenue,
      orders: item.orders
    }));
    
    // Category-wise revenue
    const categoryRevenueRaw = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $ne: 'cancelled' }
        }
      },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      { $unwind: '$productInfo' },
      {
        $group: {
          _id: '$productInfo.category',
          revenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
          orders: { $sum: 1 }
        }
      },
      { $sort: { revenue: -1 } }
    ]);
    
    // Transform data to have 'category' field instead of '_id'
    const categoryRevenue = categoryRevenueRaw.map(item => ({
      category: item._id || 'Uncategorized',
      revenue: item.revenue,
      orders: item.orders
    }));
    
    res.json({
      success: true,
      data: {
        dailyStats,
        categoryRevenue
      }
    });
  } catch (error) {
    console.error('Charts data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load chart data',
      error: error.message
    });
  }
});

/* ===============================================================================
   USER MANAGEMENT
   =============================================================================== */

/**
 * GET /api/admin-panel/users
 * Get all users with filtering and pagination
 */
router.get('/users', adminAuth, auditLogger('VIEW_USER', 'USER'), async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search = '', 
      status = 'all', // all, active, blocked, deleted
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;
    
    const skip = (page - 1) * limit;
    
    // Build query
    let query = {};
    
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { username: new RegExp(search, 'i') },
        { company: new RegExp(search, 'i') }
      ];
    }
    
    if (status === 'active') {
      query.isDeleted = false;
      query.isBlocked = false;
    } else if (status === 'blocked') {
      query.isBlocked = true;
    } else if (status === 'deleted') {
      query.isDeleted = true;
    } else if (status === 'all') {
      query.isDeleted = false;
    }
    
    const sortOptions = {};
    sortOptions[sortBy] = order === 'desc' ? -1 : 1;
    
    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      User.countDocuments(query)
    ]);
    
    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
});

/**
 * GET /api/admin-panel/users/:id
 * Get detailed user info with activity timeline
 */
router.get('/users/:id', adminAuth, auditLogger('VIEW_USER', 'USER'), async (req, res) => {
  try {
    const { id } = req.params;
    
    const [user, orderCount, totalSpent, activityLog] = await Promise.all([
      User.findById(id).select('-password'),
      Order.countDocuments({ user: id }),
      Order.aggregate([
        { $match: { user: mongoose.Types.ObjectId(id), status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      UserActivityLog.getUserTimeline(id, 50)
    ]);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    setAuditTarget(req, id, user.email);
    
    res.json({
      success: true,
      data: {
        user,
        stats: {
          orderCount,
          totalSpent: totalSpent[0]?.total || 0
        },
        activityLog
      }
    });
  } catch (error) {
    console.error('Get user detail error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user details',
      error: error.message
    });
  }
});

/**
 * PUT /api/admin-panel/users/:id/block
 * Block a user
 */
router.put('/users/:id/block', adminAuth, auditLogger('BLOCK_USER', 'USER'), async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    const user = await User.findByIdAndUpdate(
      id,
      {
        isBlocked: true,
        blockReason: reason,
        blockedAt: new Date(),
        blockedBy: req.user._id
      },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    setAuditTarget(req, id, user.email);
    setAuditMetadata(req, { reason });
    
    res.json({
      success: true,
      message: 'User blocked successfully',
      data: user
    });
  } catch (error) {
    console.error('Block user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to block user',
      error: error.message
    });
  }
});

/**
 * PUT /api/admin-panel/users/:id/unblock
 * Unblock a user
 */
router.put('/users/:id/unblock', adminAuth, auditLogger('UNBLOCK_USER', 'USER'), async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByIdAndUpdate(
      id,
      {
        isBlocked: false,
        blockReason: null,
        blockedAt: null,
        blockedBy: null
      },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    setAuditTarget(req, id, user.email);
    
    res.json({
      success: true,
      message: 'User unblocked successfully',
      data: user
    });
  } catch (error) {
    console.error('Unblock user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unblock user',
      error: error.message
    });
  }
});

/**
 * DELETE /api/admin-panel/users/:id
 * Soft delete a user
 */
router.delete('/users/:id', adminAuth, auditLogger('DELETE_USER', 'USER'), async (req, res) => {
  try {
    const { id } = req.params;
    const { permanent = false } = req.query;
    
    if (permanent === 'true') {
      // Permanent delete - only for super admin
      const user = await User.findByIdAndDelete(id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      setAuditTarget(req, id, user.email);
      setAuditMetadata(req, { permanent: true });
      
      res.json({
        success: true,
        message: 'User permanently deleted'
      });
    } else {
      // Soft delete
      const user = await User.findByIdAndUpdate(
        id,
        {
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy: req.user._id
        },
        { new: true }
      ).select('-password');
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      setAuditTarget(req, id, user.email);
      
      res.json({
        success: true,
        message: 'User deleted successfully',
        data: user
      });
    }
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message
    });
  }
});

/**
 * GET /api/admin-panel/users/export/csv
 * Export users to CSV
 */
router.get('/users/export/csv', adminAuth, auditLogger('EXPORT_USERS', 'USER'), async (req, res) => {
  try {
    const users = await User.find({ isDeleted: false }).select('-password').lean();
    
    // Convert to CSV format
    const csv = [
      ['Name', 'Email', 'Company', 'Phone', 'GST', 'Created At', 'Last Login', 'Blocked'].join(','),
      ...users.map(u => [
        u.name || '',
        u.email,
        u.company || '',
        u.phone || '',
        u.gstNumber || '',
        new Date(u.createdAt).toLocaleDateString(),
        u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never',
        u.isBlocked ? 'Yes' : 'No'
      ].join(','))
    ].join('\n');
    
    setAuditMetadata(req, { count: users.length });
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="users-${Date.now()}.csv"`);
    res.send(csv);
  } catch (error) {
    console.error('Export users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export users',
      error: error.message
    });
  }
});

module.exports = router;
