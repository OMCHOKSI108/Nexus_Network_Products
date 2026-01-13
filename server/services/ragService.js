const Product = require('../models/Product');
const Order = require('../models/Order');
const Cart = require('../models/Cart');

class RAGService {
  constructor() {
    this.websiteInfo = {
      name: 'Nexus Network Products',
      description: 'B2B supplier of brass fittings, cable gland accessories, pressure gauge parts, pneumatic parts, and air conditioning/refrigeration parts',
      categories: [
        'brass fitting',
        'brass insert',
        'panumatic part',
        'pressure gauge parts',
        'Air Conditioners and Refigeration Parts',
        'cable gland accessories'
      ],
      features: {
        preLogin: [
          'Browse product catalog',
          'Search products',
          'View product details',
          'Get product information',
          'Compare products',
          'View categories'
        ],
        postLogin: [
          'Add products to cart',
          'Manage cart items',
          'Place orders',
          'Track orders',
          'View order history',
          'Update profile',
          'Save favorites'
        ]
      }
    };
  }

  /**
   * Get relevant context based on user query
   */
  async getRelevantContext(query, userId = null, options = {}) {
    const context = {
      products: [],
      orders: [],
      cart: null,
      websiteInfo: this.websiteInfo
    };

    const queryLower = query.toLowerCase();

    // Check if query is about products
    if (this.isProductQuery(queryLower)) {
      context.products = await this.searchProducts(query, options.limit || 5);
    }

    // Check if query is about cart (only for authenticated users)
    if (userId && this.isCartQuery(queryLower)) {
      context.cart = await this.getUserCart(userId);
    }

    // Check if query is about orders (only for authenticated users)
    if (userId && this.isOrderQuery(queryLower)) {
      context.orders = await this.getUserOrders(userId, options.orderLimit || 5);
    }

    return context;
  }

  /**
   * Search products based on query
   */
  async searchProducts(query, limit = 5) {
    try {
      const queryLower = query.toLowerCase();
      let searchQuery = { isActive: true };
      
      // Check for category-specific queries
      if (queryLower.includes('brass') && queryLower.includes('fitting')) {
        searchQuery.category = /brass.*fitting/i;
      } else if (queryLower.includes('brass')) {
        searchQuery.category = /brass/i;
      } else if (queryLower.includes('cable') || queryLower.includes('gland')) {
        searchQuery.category = /cable.*gland|gland/i;
      } else if (queryLower.includes('pressure') || queryLower.includes('gauge')) {
        searchQuery.category = /pressure|gauge/i;
      } else if (queryLower.includes('pneumatic')) {
        searchQuery.category = /pneumatic|panumatic/i;
      } else if (queryLower.includes('air') || queryLower.includes('refrigeration')) {
        searchQuery.category = /air.*condition|refrigeration/i;
      } else {
        // General search across all fields
        const searchRegex = new RegExp(query.replace(/[^a-z0-9\s]/gi, ''), 'i');
        searchQuery.$or = [
          { name: searchRegex },
          { description: searchRegex },
          { category: searchRegex }
        ];
      }

      const products = await Product.find(searchQuery)
        .limit(limit)
        .select('name description price category image stockQuantity inStock sku')
        .lean();

      // If no results, try to get products from relevant category
      if (products.length === 0) {
        const fallbackProducts = await Product.find({ isActive: true })
          .limit(limit)
          .select('name description price category image stockQuantity inStock sku')
          .lean();
        return fallbackProducts;
      }

      return products;
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  }

  /**
   * Get product by ID
   */
  async getProductById(productId) {
    try {
      return await Product.findById(productId)
        .select('name description price category image stockQuantity inStock sku specifications')
        .lean();
    } catch (error) {
      console.error('Error getting product:', error);
      return null;
    }
  }

  /**
   * Get products by category
   */
  async getProductsByCategory(category, limit = 10) {
    try {
      return await Product.find({
        isActive: true,
        category: new RegExp(category, 'i')
      })
      .limit(limit)
      .select('name description price category image stockQuantity inStock')
      .lean();
    } catch (error) {
      console.error('Error getting products by category:', error);
      return [];
    }
  }

  /**
   * Get user's cart
   */
  async getUserCart(userId) {
    try {
      const cart = await Cart.findOne({ userId })
        .populate('items.productId', 'name price image stockQuantity')
        .lean();
      
      if (!cart) return null;

      return {
        items: cart.items,
        totalAmount: cart.totalAmount,
        totalItems: cart.totalItems
      };
    } catch (error) {
      console.error('Error getting user cart:', error);
      return null;
    }
  }

  /**
   * Get user's orders
   */
  async getUserOrders(userId, limit = 5) {
    try {
      return await Order.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .select('orderNumber status total items createdAt trackingNumber')
        .lean();
    } catch (error) {
      console.error('Error getting user orders:', error);
      return [];
    }
  }

  /**
   * Get order by ID or order number
   */
  async getOrderDetails(userId, orderIdentifier) {
    try {
      const query = { user: userId };
      
      // Check if it's an ObjectId or order number
      if (orderIdentifier.match(/^[0-9a-fA-F]{24}$/)) {
        query._id = orderIdentifier;
      } else {
        query.orderNumber = orderIdentifier;
      }

      return await Order.findOne(query)
        .populate('items.product', 'name image')
        .lean();
    } catch (error) {
      console.error('Error getting order details:', error);
      return null;
    }
  }

  /**
   * Check if query is about products
   */
  isProductQuery(query) {
    const productKeywords = [
      'product', 'item', 'brass', 'fitting', 'cable', 'gland', 
      'pressure', 'gauge', 'pneumatic', 'valve', 'adapter',
      'show me', 'find', 'search', 'looking for', 'need',
      'price', 'cost', 'available', 'stock', 'category',
      'buy', 'purchase', 'what', 'which', 'products', 'items',
      'there', 'have', 'sell', 'offer', 'range', 'types'
    ];
    return productKeywords.some(keyword => query.includes(keyword));
  }

  /**
   * Check if query is about cart
   */
  isCartQuery(query) {
    const cartKeywords = [
      'cart', 'basket', 'add to cart', 'remove from cart',
      'checkout', 'purchase', 'buy'
    ];
    return cartKeywords.some(keyword => query.includes(keyword));
  }

  /**
   * Check if query is about orders
   */
  isOrderQuery(query) {
    const orderKeywords = [
      'order', 'orders', 'purchase history', 'my orders',
      'track', 'tracking', 'delivery', 'shipped', 'status'
    ];
    return orderKeywords.some(keyword => query.includes(keyword));
  }

  /**
   * Format context for LLM prompt
   */
  formatContextForPrompt(context) {
    let contextText = '';

    // Add website info
    contextText += `Website: ${context.websiteInfo.name}\n`;
    contextText += `Description: ${context.websiteInfo.description}\n`;
    contextText += `Categories: ${context.websiteInfo.categories.join(', ')}\n\n`;

    // Add products if available
    if (context.products && context.products.length > 0) {
      contextText += 'Relevant Products:\n';
      context.products.forEach((product, index) => {
        contextText += `${index + 1}. ${product.name}\n`;
        contextText += `   - Price: ₹${product.price}\n`;
        contextText += `   - Category: ${product.category}\n`;
        contextText += `   - Stock: ${product.inStock ? 'In Stock' : 'Out of Stock'} (${product.stockQuantity} units)\n`;
        if (product.description) {
          contextText += `   - Description: ${product.description.substring(0, 100)}...\n`;
        }
        contextText += `   - Product ID: ${product._id}\n\n`;
      });
    }

    // Add cart info if available
    if (context.cart) {
      contextText += `\nUser's Cart:\n`;
      contextText += `- Total Items: ${context.cart.totalItems}\n`;
      contextText += `- Total Amount: ₹${context.cart.totalAmount}\n`;
      if (context.cart.items && context.cart.items.length > 0) {
        contextText += 'Cart Items:\n';
        context.cart.items.forEach((item, index) => {
          contextText += `  ${index + 1}. ${item.productName} - Qty: ${item.quantity} - ₹${item.subtotal}\n`;
        });
      }
      contextText += '\n';
    }

    // Add orders info if available
    if (context.orders && context.orders.length > 0) {
      contextText += 'Recent Orders:\n';
      context.orders.forEach((order, index) => {
        contextText += `${index + 1}. Order #${order.orderNumber}\n`;
        contextText += `   - Status: ${order.status}\n`;
        contextText += `   - Total: ₹${order.total}\n`;
        contextText += `   - Date: ${new Date(order.createdAt).toLocaleDateString()}\n`;
        if (order.trackingNumber) {
          contextText += `   - Tracking: ${order.trackingNumber}\n`;
        }
        contextText += '\n';
      });
    }

    return contextText;
  }

  /**
   * Extract potential actions from user query
   */
  extractActions(query) {
    const actions = [];
    const queryLower = query.toLowerCase();

    // Detect add to cart intent
    if (queryLower.includes('add to cart') || 
        queryLower.includes('add this') ||
        queryLower.includes('i want to buy')) {
      actions.push({ type: 'add_to_cart', requires_auth: true });
    }

    // Detect checkout intent
    if (queryLower.includes('checkout') || 
        queryLower.includes('place order') ||
        queryLower.includes('complete purchase')) {
      actions.push({ type: 'checkout', requires_auth: true });
    }

    // Detect view cart intent
    if (queryLower.includes('view cart') || 
        queryLower.includes('show cart') ||
        queryLower.includes('my cart')) {
      actions.push({ type: 'view_cart', requires_auth: true });
    }

    // Detect order tracking intent
    if (queryLower.includes('track') || 
        queryLower.includes('order status')) {
      actions.push({ type: 'track_order', requires_auth: true });
    }

    return actions;
  }
}

module.exports = new RAGService();
