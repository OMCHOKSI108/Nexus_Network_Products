const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  productImage: String,
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1']
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price must be positive']
  },
  subtotal: {
    type: Number,
    required: true,
    min: [0, 'Subtotal must be positive']
  }
});

const shippingAddressSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  state: {
    type: String,
    required: true,
    trim: true
  },
  postalCode: {
    type: String,
    required: true,
    trim: true
  },
  country: {
    type: String,
    required: true,
    default: 'India',
    trim: true
  },
  phone: {
    type: String,
    required: true,
    validate: {
      validator: function(phone) {
        return /^[\+]?[1-9][\d]{0,15}$/.test(phone);
      },
      message: 'Please enter a valid phone number'
    }
  }
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    sparse: true // Allow null/undefined during creation, but enforce uniqueness when present
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  shippingAddress: {
    type: shippingAddressSchema,
    required: true
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['card', 'cod', 'upi', 'netbanking'],
    default: 'cod'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  orderStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned'],
    default: 'pending'
  },
  subtotal: {
    type: Number,
    required: true,
    min: [0, 'Subtotal must be positive']
  },
  tax: {
    type: Number,
    default: 0,
    min: [0, 'Tax must be positive']
  },
  shippingCost: {
    type: Number,
    default: 0,
    min: [0, 'Shipping cost must be positive']
  },
  total: {
    type: Number,
    required: true,
    min: [0, 'Total must be positive']
  },
  currency: {
    type: String,
    default: 'INR'
  },
  notes: {
    type: String,
    trim: true
  },
  trackingNumber: {
    type: String,
    trim: true
  },
  estimatedDelivery: Date,
  deliveredAt: Date,
  cancelledAt: Date,
  cancellationReason: String,
  statusHistory: [{
    status: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    comment: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'statusHistory.updatedByModel'
    },
    updatedByModel: {
      type: String,
      enum: ['User', 'Admin']
    }
  }]
}, {
  timestamps: true
});

// Indexes for efficient queries
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });

// Pre-save middleware to generate order number
orderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    try {
      // Generate order number: PP-YYYYMMDD-XXXX
      const date = new Date();
      const dateStr = date.getFullYear().toString() + 
                     (date.getMonth() + 1).toString().padStart(2, '0') + 
                     date.getDate().toString().padStart(2, '0');
      
      // Find the last order of the day
      const lastOrder = await this.constructor.findOne({
        orderNumber: new RegExp(`^PP-${dateStr}-`)
      }).sort({ orderNumber: -1 });
      
      let sequence = 1;
      if (lastOrder) {
        const lastSequence = parseInt(lastOrder.orderNumber.split('-')[2]);
        sequence = lastSequence + 1;
      }
      
      this.orderNumber = `PP-${dateStr}-${sequence.toString().padStart(4, '0')}`;
    } catch (error) {
      console.error('Error generating order number:', error);
      // Fallback to timestamp-based order number
      this.orderNumber = `PP-${Date.now()}`;
    }
  }
  next();
});

// Pre-save middleware to add status history
orderSchema.pre('save', function(next) {
  if (this.isModified('orderStatus') && !this.isNew) {
    this.statusHistory.push({
      status: this.orderStatus,
      timestamp: new Date(),
      comment: `Status changed to ${this.orderStatus}`
    });
  }
  next();
});

// Method to update order status
orderSchema.methods.updateStatus = function(newStatus, comment, updatedBy, updatedByModel) {
  this.orderStatus = newStatus;
  
  // Set special timestamps
  if (newStatus === 'delivered') {
    this.deliveredAt = new Date();
  } else if (newStatus === 'cancelled') {
    this.cancelledAt = new Date();
  }
  
  // Add to status history
  this.statusHistory.push({
    status: newStatus,
    timestamp: new Date(),
    comment: comment || `Status changed to ${newStatus}`,
    updatedBy: updatedBy,
    updatedByModel: updatedByModel || 'Admin'
  });
  
  return this.save();
};

// Method to calculate order totals
orderSchema.methods.calculateTotals = function() {
  this.subtotal = this.items.reduce((sum, item) => sum + item.subtotal, 0);
  this.total = this.subtotal + this.tax + this.shippingCost;
  return this;
};

// Static method to get order statistics
orderSchema.statics.getOrderStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$orderStatus',
        count: { $sum: 1 },
        totalAmount: { $sum: '$total' }
      }
    }
  ]);
  
  const totalOrders = await this.countDocuments();
  const todayOrders = await this.countDocuments({
    createdAt: {
      $gte: new Date(new Date().setHours(0, 0, 0, 0))
    }
  });
  
  return {
    totalOrders,
    todayOrders,
    statusBreakdown: stats
  };
};

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;