const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const auth = require('../middleware/auth');

// Create new order
router.post('/', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { shippingAddress, paymentMethod, notes } = req.body;
    console.log('🧾 Create order request from user:', userId.toString());

    // Validate required fields
    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        message: 'Shipping address is required'
      });
    }

  // Get user's cart (using current schema with userId and productId)
  const cart = await Cart.findOne({ userId }).populate('items.productId', 'name price image stockQuantity inStock isActive');
  console.log('🛒 Order - loaded cart?', !!cart, 'items:', cart?.items?.length || 0);
    
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    // Prepare order items
    const orderItems = [];
    let subtotal = 0;

    for (const cartItem of cart.items) {
      // cart item structure: { productId, productName, productPrice, productImage, quantity, subtotal }
      const productDoc = cartItem.productId; // may be populated
      if (!productDoc) {
        return res.status(400).json({ success: false, message: 'Product not found in cart' });
      }

      // Check availability
      if (productDoc.isActive === false || productDoc.inStock === false) {
        return res.status(400).json({ success: false, message: `${productDoc.name} is not available` });
      }

      if (typeof productDoc.stockQuantity === 'number' && productDoc.stockQuantity < cartItem.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${productDoc.name}. Available: ${productDoc.stockQuantity}, Required: ${cartItem.quantity}`
        });
      }

      const price = cartItem.productPrice ?? productDoc.price ?? 0;
      const itemSubtotal = cartItem.subtotal ?? (price * cartItem.quantity);
      subtotal += itemSubtotal;

      orderItems.push({
        product: productDoc._id,
        productName: cartItem.productName || productDoc.name,
        productImage: cartItem.productImage || productDoc.image || '',
        quantity: cartItem.quantity,
        price,
        subtotal: itemSubtotal
      });
    }

    // Calculate totals (no tax or shipping for now)
    const tax = 0;
    const shippingCost = 0;
    const total = subtotal + tax + shippingCost;

    // Create order
    const order = new Order({
      user: userId,
      items: orderItems,
      shippingAddress,
      paymentMethod: paymentMethod || 'cod',
      paymentStatus: 'pending',
      subtotal,
      tax,
      shippingCost,
      total,
      notes: notes || '',
      statusHistory: [{
        status: 'pending',
        timestamp: new Date(),
        comment: 'Order placed successfully'
      }]
    });

    // Save order
    const savedOrder = await order.save();

    // Update product stock
    for (const cartItem of cart.items) {
      await Product.findByIdAndUpdate(
        cartItem.productId._id || cartItem.productId,
        { $inc: { stockQuantity: -cartItem.quantity } }
      );
    }

    // Clear cart after successful order
    await Cart.findOneAndUpdate(
      { userId },
      { 
        items: [], 
        totalItems: 0, 
        totalAmount: 0 
      }
    );

    // Populate order for response
    const populatedOrder = await Order.findById(savedOrder._id)
      .populate('user', 'username email')
      .populate('items.product', 'name image');

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order: populatedOrder
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
});

// Get user's orders
router.get('/user', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find({ user: userId })
      .populate('items.product', 'name image')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalOrders = await Order.countDocuments({ user: userId });
    const totalPages = Math.ceil(totalOrders / limit);

    res.json({
      success: true,
      orders,
      pagination: {
        currentPage: page,
        totalPages,
        totalOrders,
        hasMore: page < totalPages
      }
    });

  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
});

// Get specific order by ID
router.get('/:orderId', auth, async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user._id;

    const order = await Order.findOne({ _id: orderId, user: userId })
      .populate('user', 'username email')
      .populate('items.product', 'name image');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      order
    });

  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
      error: error.message
    });
  }
});

// Cancel order (only if status is pending or confirmed)
router.put('/:orderId/cancel', auth, async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user._id;
    const { reason } = req.body;

    const order = await Order.findOne({ _id: orderId, user: userId })
      .populate('items.product');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if order can be cancelled
    if (!['pending', 'confirmed'].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled at this stage'
      });
    }

    // Update order status
    await order.updateStatus('cancelled', `Order cancelled by customer. Reason: ${reason || 'No reason provided'}`, userId, 'User');

    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.product._id,
        { $inc: { stockQuantity: item.quantity } }
      );
    }

    // Set cancellation details
    order.cancelledAt = new Date();
    order.cancellationReason = reason || 'Cancelled by customer';
    await order.save();

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      order
    });

  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel order',
      error: error.message
    });
  }
});

module.exports = router;