const express = require('express');
const { adminAuth, superAdminAuth } = require('../middleware/adminAuth');
const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|svg/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// ==================== DASHBOARD ROUTES ====================

// Dashboard Overview
router.get('/dashboard/overview', adminAuth, async (req, res) => {
  try {
    // Get totals
    const [totalProducts, totalUsers, totalOrders] = await Promise.all([
      Product.countDocuments(),
      User.countDocuments(),
      Order.countDocuments()
    ]);

    // Get order statistics
    const orderStats = await Order.getOrderStats();

    // Get recent orders (last 10)
    const recentOrders = await Order.find()
      .populate('user', 'username email')
      .sort({ createdAt: -1 })
      .limit(10)
      .select('orderNumber user total orderStatus paymentStatus createdAt shippingAddress');
    
    console.log('🔍 Recent orders with shipping address:', recentOrders.map(o => ({
      orderNumber: o.orderNumber,
      username: o.user?.username,
      shippingName: o.shippingAddress?.fullName
    })));

    // Get low stock products (less than 10 items)
    const lowStockProducts = await Product.find({ stock: { $lt: 10 } })
      .select('name stock category')
      .limit(10);

    // Calculate revenue stats
    const revenueStats = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total' },
          averageOrderValue: { $avg: '$total' }
        }
      }
    ]);

    // Get monthly revenue for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
          paymentStatus: 'paid'
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalProducts,
          totalUsers,
          totalOrders,
          totalRevenue: revenueStats[0]?.totalRevenue || 0,
          averageOrderValue: revenueStats[0]?.averageOrderValue || 0
        },
        orderStats: {
          ...orderStats,
          monthlyRevenue
        },
        recentOrders,
        lowStockProducts
      }
    });

  } catch (error) {
    console.error('Dashboard overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data'
    });
  }
});

// ==================== PRODUCT MANAGEMENT ROUTES ====================

// Get all products for admin
router.get('/products', adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build filter
    let filter = {};
    if (req.query.category) {
      filter.category = req.query.category;
    }
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
        { category: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Product.countDocuments(filter)
    ]);

    // Transform products to match frontend expectations
    const transformedProducts = products.map(product => ({
      ...product.toObject(),
      stock: product.stockQuantity || 0
    }));

    res.json({
      success: true,
      data: {
        products: transformedProducts,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit
        }
      }
    });

  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products'
    });
  }
});

// Add new product
router.post('/products', adminAuth, upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, category, stock } = req.body;

    // Validation
    if (!name || !price || !category) {
      return res.status(400).json({
        success: false,
        message: 'Name, price, and category are required'
      });
    }

    // Create product data
    const productData = {
      name: name.trim(),
      description: description?.trim() || '',
      price: parseFloat(price),
      category: category.trim(),
      stockQuantity: parseInt(stock) || 0,
      inStock: parseInt(stock) > 0
    };

    // Add image if uploaded
    if (req.file) {
      productData.image = `/uploads/${req.file.filename}`;
    }

    // Create product
    const product = new Product(productData);
    await product.save();

    console.log(`✅ Product created by admin ${req.admin.email}: ${product.name}`);

    const transformedProduct = {
      ...product.toObject(),
      stock: product.stockQuantity || 0
    };

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { product: transformedProduct }
    });

  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create product'
    });
  }
});

// Update product
router.put('/products/:id', adminAuth, upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, stock } = req.body;

    // Find product
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Update fields
    if (name) product.name = name.trim();
    if (description !== undefined) product.description = description.trim();
    if (price) product.price = parseFloat(price);
    if (category) product.category = category.trim();
    if (stock !== undefined) {
      product.stockQuantity = parseInt(stock);
      product.inStock = parseInt(stock) > 0;
    }

    // Update image if uploaded
    if (req.file) {
      product.image = `/uploads/${req.file.filename}`;
    }

    await product.save();

    console.log(`✅ Product updated by admin ${req.admin.email}: ${product.name}`);

    const transformedProduct = {
      ...product.toObject(),
      stock: product.stockQuantity || 0
    };

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: { product: transformedProduct }
    });

  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product'
    });
  }
});

// Delete product
router.delete('/products/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndDelete(id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    console.log(`❌ Product deleted by admin ${req.admin.email}: ${product.name}`);

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product'
    });
  }
});

// ==================== ORDER MANAGEMENT ROUTES ====================

// Get all orders for admin
router.get('/orders', adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build filter
    let filter = {};
    if (req.query.status) {
      filter.orderStatus = req.query.status;
    }
    if (req.query.paymentStatus) {
      filter.paymentStatus = req.query.paymentStatus;
    }
    if (req.query.search) {
      filter.$or = [
        { orderNumber: { $regex: req.query.search, $options: 'i' } },
        { 'shippingAddress.fullName': { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('user', 'username email')
        .populate('items.product', 'name image')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(), // Use lean for better performance
      Order.countDocuments(filter)
    ]);

    console.log('🔍 Orders with shipping address:', orders.slice(0, 2).map(o => ({
      orderNumber: o.orderNumber,
      username: o.user?.username,
      shippingName: o.shippingAddress?.fullName
    })));

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit
        }
      }
    });

  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
});

// Get single order details
router.get('/orders/:id', adminAuth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'username email phone')
      .populate('items.product', 'name image category')
      .populate('statusHistory.updatedBy', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: { order }
    });

  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order details'
    });
  }
});

// Update order status
router.put('/orders/:id/status', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, comment } = req.body;

    // Validation
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order status'
      });
    }

    // Find order
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Update status
    await order.updateStatus(status, comment, req.admin._id, 'Admin');

    console.log(`📝 Order status updated by admin ${req.admin.email}: ${order.orderNumber} -> ${status}`);

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: { order }
    });

  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status'
    });
  }
});

// ==================== USER MANAGEMENT ROUTES ====================

// Get all users
router.get('/users', adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build filter
    let filter = {};
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
        { username: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit
        }
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
});

module.exports = router;