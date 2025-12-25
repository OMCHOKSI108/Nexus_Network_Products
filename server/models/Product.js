const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: [
      'brass fitting',
      'brass insert', 
      'panumatic part',
      'pressure gauge parts',
      'Air Conditioners and Refigeration Parts',
      'cable gland accessories'
    ]
  },
  image: {
    type: String,
    default: ''
  },
  sku: {
    type: String,
    trim: true,
    index: true
  },
  inStock: {
    type: Boolean,
    default: true
  },
  stockQuantity: {
    type: Number,
    default: 0,
    min: 0
  },
  // Flexible key/value specifications for B2B details
  specifications: {
    type: Map,
    of: String,
    default: {}
  },
  // Stock status enum for clearer frontend badges
  stockStatus: {
    type: String,
    enum: ['in_stock', 'out_of_stock', 'limited'],
    default: 'in_stock'
  },
  deliveryInfo: {
    deliveryTime: { type: String }, // e.g. "2-4 business days"
    codAvailable: { type: Boolean, default: true },
    returnPolicy: { type: String }
  },
  certifications: [{ type: String }],
  relatedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  usageAreas: [{ type: String }],
  faqs: [{ question: String, answer: String }],
  datasheetUrl: { type: String },
  bulkPricing: [{ minQty: Number, maxQty: Number, price: Number }],
  reviews: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, rating: Number, comment: String }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Add index for better search performance
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ isActive: 1 });

module.exports = mongoose.model('Product', productSchema);
