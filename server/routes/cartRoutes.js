const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const authenticateToken = require('../middleware/auth');

// ✅ GET CART - Get user's cart
router.get('/', authenticateToken, async (req, res) => {
  try {
    console.log('📥 Getting cart for user:', req.user._id);
    
    let cart = await Cart.findOne({ userId: req.user._id }).populate('items.productId', 'name price image');
    
    if (!cart) {
      // Create empty cart if none exists
      cart = new Cart({
        userId: req.user._id,
        items: [],
        totalAmount: 0,
        totalItems: 0
      });
      await cart.save();
    }

    res.status(200).json({
      success: true,
      cart: {
        id: cart._id,
        userId: cart.userId,
        items: cart.items,
        totalAmount: cart.totalAmount,
        totalItems: cart.totalItems,
        lastUpdated: cart.lastUpdated
      }
    });
  } catch (error) {
    console.error('⚠️ Get cart error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error retrieving cart' 
    });
  }
});

// ✅ ADD TO CART - Add product to cart
router.post('/add', authenticateToken, async (req, res) => {
  try {
    console.log('📥 Add to cart data:', req.body);
    const { productId, quantity = 1 } = req.body;
    const userId = req.user._id;

    if (!productId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Product ID is required' 
      });
    }

    if (quantity < 1) {
      return res.status(400).json({ 
        success: false, 
        message: 'Quantity must be at least 1' 
      });
    }

    // Get product details
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
    }

    if (!product.isActive || !product.inStock) {
      return res.status(400).json({ 
        success: false, 
        message: 'Product is not available' 
      });
    }

    // Check stock availability
    if (product.stockQuantity < quantity) {
      return res.status(400).json({ 
        success: false, 
        message: `Only ${product.stockQuantity} items available in stock` 
      });
    }

    // Find or create cart
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({
        userId,
        items: []
      });
    }

    // Add item to cart
    await cart.addItem({
      productId: product._id,
      productName: product.name,
      productPrice: product.price,
      productImage: product.image,
      quantity: parseInt(quantity)
    });

    console.log('✅ Item added to cart successfully');

    res.status(200).json({
      success: true,
      message: 'Item added to cart successfully',
      cart: {
        id: cart._id,
        userId: cart.userId,
        items: cart.items,
        totalAmount: cart.totalAmount,
        totalItems: cart.totalItems,
        lastUpdated: cart.lastUpdated
      }
    });
  } catch (error) {
    console.error('⚠️ Add to cart error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error adding item to cart' 
    });
  }
});

// ✅ UPDATE CART ITEM - Update quantity of item in cart
router.put('/update', authenticateToken, async (req, res) => {
  try {
    console.log('📥 Update cart item data:', req.body);
    const { productId, quantity } = req.body;
    const userId = req.user._id;

    if (!productId || quantity === undefined) {
      return res.status(400).json({ 
        success: false, 
        message: 'Product ID and quantity are required' 
      });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ 
        success: false, 
        message: 'Cart not found' 
      });
    }

    // If quantity is 0 or negative, remove item
    if (quantity <= 0) {
      await cart.removeItem(productId);
    } else {
      // Check stock availability for the product
      const product = await Product.findById(productId);
      if (product && product.stockQuantity < quantity) {
        return res.status(400).json({ 
          success: false, 
          message: `Only ${product.stockQuantity} items available in stock` 
        });
      }
      
      await cart.updateItemQuantity(productId, parseInt(quantity));
    }

    // Reload cart with populated product data to ensure fresh state
    const updatedCart = await Cart.findById(cart._id).populate('items.productId', 'name price image');

    console.log('✅ Cart item updated successfully');
    console.log('📊 Updated cart totals:', {
      totalItems: updatedCart.totalItems,
      totalAmount: updatedCart.totalAmount,
      itemCount: updatedCart.items.length
    });

    res.status(200).json({
      success: true,
      message: 'Cart updated successfully',
      cart: {
        id: updatedCart._id,
        userId: updatedCart.userId,
        items: updatedCart.items,
        totalAmount: updatedCart.totalAmount,
        totalItems: updatedCart.totalItems,
        lastUpdated: updatedCart.lastUpdated
      }
    });
  } catch (error) {
    console.error('⚠️ Update cart error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Error updating cart' 
    });
  }
});

// ✅ REMOVE FROM CART - Remove item from cart
router.delete('/remove/:productId', authenticateToken, async (req, res) => {
  try {
    console.log('📥 Remove from cart:', req.params.productId);
    const { productId } = req.params;
    const userId = req.user._id;

    // Validate productId format
    if (!productId || productId === '[object Object]' || productId === 'undefined' || productId === 'null') {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid product ID' 
      });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ 
        success: false, 
        message: 'Cart not found' 
      });
    }

    await cart.removeItem(productId);

    // Reload cart with populated product data to ensure fresh state
    const updatedCart = await Cart.findById(cart._id).populate('items.productId', 'name price image');

    console.log('✅ Item removed from cart successfully');
    console.log('📊 Updated cart totals:', {
      totalItems: updatedCart.totalItems,
      totalAmount: updatedCart.totalAmount,
      itemCount: updatedCart.items.length
    });

    res.status(200).json({
      success: true,
      message: 'Item removed from cart successfully',
      cart: {
        id: updatedCart._id,
        userId: updatedCart.userId,
        items: updatedCart.items,
        totalAmount: updatedCart.totalAmount,
        totalItems: updatedCart.totalItems,
        lastUpdated: updatedCart.lastUpdated
      }
    });
  } catch (error) {
    console.error('⚠️ Remove from cart error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error removing item from cart' 
    });
  }
});

// ✅ CLEAR CART - Clear all items from cart
router.delete('/clear', authenticateToken, async (req, res) => {
  try {
    console.log('📥 Clearing cart for user:', req.user._id);
    const userId = req.user._id;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ 
        success: false, 
        message: 'Cart not found' 
      });
    }

    await cart.clearCart();

    console.log('✅ Cart cleared successfully');

    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
      cart: {
        id: cart._id,
        userId: cart.userId,
        items: cart.items,
        totalAmount: cart.totalAmount,
        totalItems: cart.totalItems,
        lastUpdated: cart.lastUpdated
      }
    });
  } catch (error) {
    console.error('⚠️ Clear cart error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error clearing cart' 
    });
  }
});

// ✅ GET CART COUNT - Get total items in cart (for navbar badge)
router.get('/count', authenticateToken, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id });
    const count = cart ? cart.totalItems : 0;

    res.status(200).json({
      success: true,
      count
    });
  } catch (error) {
    console.error('⚠️ Get cart count error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error getting cart count' 
    });
  }
});

module.exports = router;
