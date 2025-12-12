const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  productPrice: {
    type: Number,
    required: true
  },
  productImage: {
    type: String,
    default: ''
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  subtotal: {
    type: Number,
    required: true
  }
}, {
  _id: false // Don't create separate _id for cart items
});

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true // Each user can have only one cart
  },
  items: [cartItemSchema],
  totalAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  totalItems: {
    type: Number,
    default: 0,
    min: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update totals before saving
cartSchema.pre('save', function(next) {
  this.totalItems = this.items.reduce((total, item) => total + item.quantity, 0);
  this.totalAmount = this.items.reduce((total, item) => total + item.subtotal, 0);
  this.lastUpdated = new Date();
  next();
});

// Method to add item to cart
cartSchema.methods.addItem = function(productData) {
  const existingItemIndex = this.items.findIndex(
    item => item.productId.toString() === productData.productId.toString()
  );

  if (existingItemIndex > -1) {
    // Item exists, increase quantity
    this.items[existingItemIndex].quantity += productData.quantity || 1;
    this.items[existingItemIndex].subtotal = 
      this.items[existingItemIndex].quantity * this.items[existingItemIndex].productPrice;
  } else {
    // New item, add to cart
    const newItem = {
      productId: productData.productId,
      productName: productData.productName,
      productPrice: productData.productPrice,
      productImage: productData.productImage || '',
      quantity: productData.quantity || 1,
      subtotal: (productData.quantity || 1) * productData.productPrice
    };
    this.items.push(newItem);
  }
  
  return this.save();
};

// Method to update item quantity
cartSchema.methods.updateItemQuantity = function(productId, quantity) {
  const itemIndex = this.items.findIndex(
    item => item.productId.toString() === productId.toString()
  );

  if (itemIndex > -1) {
    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      this.items.splice(itemIndex, 1);
    } else {
      // Update quantity and subtotal
      this.items[itemIndex].quantity = quantity;
      this.items[itemIndex].subtotal = quantity * this.items[itemIndex].productPrice;
    }
    return this.save();
  }
  throw new Error('Item not found in cart');
};

// Method to remove item from cart
cartSchema.methods.removeItem = function(productId) {
  this.items = this.items.filter(
    item => item.productId.toString() !== productId.toString()
  );
  return this.save();
};

// Method to clear cart
cartSchema.methods.clearCart = function() {
  this.items = [];
  return this.save();
};

module.exports = mongoose.model('Cart', cartSchema);
