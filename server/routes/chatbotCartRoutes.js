const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const authenticateToken = require('../middleware/auth');

/**
 * Chatbot-specific cart actions
 * These endpoints are optimized for conversational interfaces
 */

/**
 * POST /api/chatbot/cart/add
 * Add product to cart via chatbot
 */
router.post('/add', authenticateToken, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const userId = req.user._id;

    // Validate product
    const product = await Product.findById(productId);
    if (!product || !product.isActive || !product.inStock) {
      return res.status(400).json({
        success: false,
        message: `Sorry, "${product?.name || 'this product'}" is currently unavailable.`,
        naturalResponse: true
      });
    }

    // Check stock
    if (product.stockQuantity < quantity) {
      return res.status(400).json({
        success: false,
        message: `Sorry, only ${product.stockQuantity} units of "${product.name}" are available in stock.`,
        naturalResponse: true
      });
    }

    // Find or create cart
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    // Add item
    await cart.addItem({
      productId: product._id,
      productName: product.name,
      productPrice: product.price,
      productImage: product.image,
      quantity
    });

    await cart.save();

    // Populate for response
    await cart.populate('items.productId', 'name price image');

    res.status(200).json({
      success: true,
      message: `Great! I've added ${quantity} ${product.name}(s) to your cart. Your cart now has ${cart.totalItems} items totaling ₹${cart.totalAmount}.`,
      naturalResponse: true,
      cart: {
        totalItems: cart.totalItems,
        totalAmount: cart.totalAmount,
        items: cart.items
      },
      suggestedActions: [
        { type: 'view_cart', label: 'View Cart' },
        { type: 'continue_shopping', label: 'Continue Shopping' },
        { type: 'checkout', label: 'Proceed to Checkout' }
      ]
    });

  } catch (error) {
    console.error('❌ Chatbot add to cart error:', error);
    res.status(500).json({
      success: false,
      message: "I'm having trouble adding that to your cart. Please try again.",
      naturalResponse: true
    });
  }
});

/**
 * GET /api/chatbot/cart
 * Get cart summary for chatbot
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;

    const cart = await Cart.findOne({ userId })
      .populate('items.productId', 'name price image stockQuantity inStock');

    if (!cart || cart.items.length === 0) {
      return res.status(200).json({
        success: true,
        message: "Your cart is empty. Would you like me to help you find some products?",
        naturalResponse: true,
        cart: null,
        isEmpty: true
      });
    }

    // Create a natural language summary
    const itemsSummary = cart.items.map(item => 
      `${item.quantity}x ${item.productName} (₹${item.subtotal})`
    ).join(', ');

    res.status(200).json({
      success: true,
      message: `You have ${cart.totalItems} item(s) in your cart: ${itemsSummary}. Total: ₹${cart.totalAmount}.`,
      naturalResponse: true,
      cart: {
        totalItems: cart.totalItems,
        totalAmount: cart.totalAmount,
        items: cart.items.map(item => ({
          productId: item.productId._id,
          productName: item.productName,
          quantity: item.quantity,
          price: item.productPrice,
          subtotal: item.subtotal,
          image: item.productImage,
          inStock: item.productId?.inStock
        }))
      },
      suggestedActions: [
        { type: 'checkout', label: 'Proceed to Checkout' },
        { type: 'clear_cart', label: 'Clear Cart' },
        { type: 'continue_shopping', label: 'Continue Shopping' }
      ]
    });

  } catch (error) {
    console.error('❌ Chatbot get cart error:', error);
    res.status(500).json({
      success: false,
      message: "I'm having trouble retrieving your cart. Please try again.",
      naturalResponse: true
    });
  }
});

/**
 * DELETE /api/chatbot/cart/item/:productId
 * Remove item from cart via chatbot
 */
router.delete('/item/:productId', authenticateToken, async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Your cart is already empty.",
        naturalResponse: true
      });
    }

    const itemToRemove = cart.items.find(item => 
      item.productId.toString() === productId
    );

    if (!itemToRemove) {
      return res.status(404).json({
        success: false,
        message: "That item is not in your cart.",
        naturalResponse: true
      });
    }

    const productName = itemToRemove.productName;

    await cart.removeItem(productId);
    await cart.save();

    res.status(200).json({
      success: true,
      message: `I've removed ${productName} from your cart. ${cart.totalItems > 0 ? `You now have ${cart.totalItems} item(s) totaling ₹${cart.totalAmount}.` : 'Your cart is now empty.'}`,
      naturalResponse: true,
      cart: {
        totalItems: cart.totalItems,
        totalAmount: cart.totalAmount
      }
    });

  } catch (error) {
    console.error('❌ Chatbot remove from cart error:', error);
    res.status(500).json({
      success: false,
      message: "I'm having trouble removing that item. Please try again.",
      naturalResponse: true
    });
  }
});

/**
 * PUT /api/chatbot/cart/item/:productId
 * Update item quantity via chatbot
 */
router.put('/item/:productId', authenticateToken, async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    const userId = req.user._id;

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Please specify a valid quantity (at least 1).",
        naturalResponse: true
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "I couldn't find that product.",
        naturalResponse: true
      });
    }

    if (product.stockQuantity < quantity) {
      return res.status(400).json({
        success: false,
        message: `Sorry, only ${product.stockQuantity} units of "${product.name}" are available.`,
        naturalResponse: true
      });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Your cart is empty.",
        naturalResponse: true
      });
    }

    await cart.updateItemQuantity(productId, quantity);
    await cart.save();

    res.status(200).json({
      success: true,
      message: `I've updated ${product.name} to ${quantity} unit(s). Your cart total is now ₹${cart.totalAmount}.`,
      naturalResponse: true,
      cart: {
        totalItems: cart.totalItems,
        totalAmount: cart.totalAmount
      }
    });

  } catch (error) {
    console.error('❌ Chatbot update cart error:', error);
    res.status(500).json({
      success: false,
      message: "I'm having trouble updating your cart. Please try again.",
      naturalResponse: true
    });
  }
});

/**
 * DELETE /api/chatbot/cart/clear
 * Clear entire cart via chatbot
 */
router.delete('/clear', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;

    const cart = await Cart.findOne({ userId });
    if (!cart || cart.items.length === 0) {
      return res.status(200).json({
        success: true,
        message: "Your cart is already empty.",
        naturalResponse: true
      });
    }

    await cart.clearCart();
    await cart.save();

    res.status(200).json({
      success: true,
      message: "I've cleared all items from your cart.",
      naturalResponse: true,
      cart: {
        totalItems: 0,
        totalAmount: 0
      }
    });

  } catch (error) {
    console.error('❌ Chatbot clear cart error:', error);
    res.status(500).json({
      success: false,
      message: "I'm having trouble clearing your cart. Please try again.",
      naturalResponse: true
    });
  }
});

module.exports = router;
