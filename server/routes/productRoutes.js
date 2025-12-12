const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const authenticateToken = require('../middleware/auth');

// ✅ GET ALL PRODUCTS
router.get('/', async (req, res) => {
  try {
    const { category, search, page = 1, limit = 12 } = req.query;
    
    let query = { isActive: true };
    
    // Add category filter
    if (category) {
      query.category = category;
    }
    
    // Add search functionality with case-insensitive regex
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    const products = await Product.find(query)
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 });
    
    const total = await Product.countDocuments(query);
    
    res.status(200).json({
      success: true,
      products,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalProducts: total,
        hasNext: pageNum < Math.ceil(total / limitNum),
        hasPrev: pageNum > 1
      }
    });
  } catch (error) {
    console.error('⚠️ Get products error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error retrieving products' 
    });
  }
});

// ✅ GET PRODUCT BY ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product || !product.isActive) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
    }
    
    res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    console.error('⚠️ Get product error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error retrieving product' 
    });
  }
});

// ✅ CREATE PRODUCT (Admin only - you can add admin middleware later)
router.post('/', async (req, res) => {
  try {
    const productData = req.body;
    
    const product = new Product(productData);
    await product.save();
    
    console.log('✅ Product created:', product._id);
    
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    console.error('⚠️ Create product error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating product' 
    });
  }
});

// ✅ SEED PRODUCTS WITH REAL IMAGES
router.post('/seed-with-images', async (req, res) => {
  try {
    // Clear existing products first
    await Product.deleteMany({});
    
    const realProducts = [
      // Brass Fitting Products
      {
        name: 'Brass Elbow Fitting 90°',
        description: 'High-quality brass elbow fitting for 90-degree pipe connections. Ideal for plumbing and industrial applications.',
        price: 35.99,
        category: 'brass fitting',
        image: '/images/products/brass-fitting/brass-fitting-1.jpg',
        stockQuantity: 100,
        specifications: {
          material: 'Brass',
          dimensions: '1/2 inch',
          weight: '150g',
          finish: 'Natural Brass'
        }
      },
      {
        name: 'Brass Tee Fitting',
        description: 'Premium brass tee fitting for T-junction pipe connections. Durable and corrosion-resistant.',
        price: 42.50,
        category: 'brass fitting',
        image: '/images/products/brass-fitting/brass-fitting-2.jpg',
        stockQuantity: 85,
        specifications: {
          material: 'Brass',
          dimensions: '3/4 inch',
          weight: '200g',
          finish: 'Polished Brass'
        }
      },
      {
        name: 'Brass Coupling Fitting',
        description: 'Straight brass coupling for connecting two pipes of the same diameter. Professional grade quality.',
        price: 28.75,
        category: 'brass fitting',
        image: '/images/products/brass-fitting/brass-fitting-3.jpg',
        stockQuantity: 120,
        specifications: {
          material: 'Brass',
          dimensions: '1 inch',
          weight: '180g',
          finish: 'Natural Brass'
        }
      },

      // Brass Insert Products
      {
        name: 'Threaded Brass Insert M6',
        description: 'Precision-manufactured brass insert for wood and plastic applications. Easy installation.',
        price: 15.99,
        category: 'brass insert',
        image: '/images/products/brass-insert/brass-insert-1.jpg',
        stockQuantity: 200,
        specifications: {
          material: 'Brass',
          dimensions: 'M6 x 1.0',
          weight: '8g',
          finish: 'Natural Brass'
        }
      },
      {
        name: 'Knurled Brass Insert M8',
        description: 'Knurled brass insert for secure installation in softer materials. High holding strength.',
        price: 18.50,
        category: 'brass insert',
        image: '/images/products/brass-insert/brass-insert-2.jpg',
        stockQuantity: 150,
        specifications: {
          material: 'Brass',
          dimensions: 'M8 x 1.25',
          weight: '12g',
          finish: 'Natural Brass'
        }
      },

      // Pneumatic Parts
      {
        name: 'Brass Pneumatic Quick Connect',
        description: 'Quick-connect pneumatic fitting for air line connections. One-touch operation.',
        price: 22.99,
        category: 'panumatic part',
        image: '/images/products/panumatic-part/panumatic-part-1.jpg',
        stockQuantity: 75,
        specifications: {
          material: 'Brass',
          dimensions: '6mm',
          weight: '25g',
          finish: 'Nickel Plated'
        }
      },
      {
        name: 'Pneumatic Brass Valve',
        description: 'High-performance brass valve for pneumatic systems. Reliable flow control.',
        price: 45.75,
        category: 'panumatic part',
        image: '/images/products/panumatic-part/panumatic-part-2.jpg',
        stockQuantity: 60,
        specifications: {
          material: 'Brass',
          dimensions: '1/4 inch NPT',
          weight: '85g',
          finish: 'Polished Brass'
        }
      },

      // Pressure Gauge Parts
      {
        name: 'Brass Pressure Gauge Adapter',
        description: 'Precision brass adapter for pressure gauge connections. Standard thread compatibility.',
        price: 32.50,
        category: 'pressure gauge parts',
        image: '/images/products/pressure-gauge-parts/pressure-gauge-1.jpg',
        stockQuantity: 90,
        specifications: {
          material: 'Brass',
          dimensions: '1/4 inch NPT',
          weight: '45g',
          finish: 'Natural Brass'
        }
      },
      {
        name: 'Brass Pressure Port Fitting',
        description: 'Heavy-duty brass fitting for pressure measurement applications. High pressure rated.',
        price: 38.99,
        category: 'pressure gauge parts',
        image: '/images/products/pressure-gauge-parts/pressure-gauge-2.jpg',
        stockQuantity: 70,
        specifications: {
          material: 'Brass',
          dimensions: '1/8 inch NPT',
          weight: '35g',
          finish: 'Nickel Plated'
        }
      },

      // Air Conditioner & Refrigeration Parts
      {
        name: 'Brass AC Service Valve',
        description: 'Professional-grade brass service valve for air conditioning systems. Leak-proof design.',
        price: 55.99,
        category: 'Air Conditioners and Refigeration Parts',
        image: '/images/products/air-conditioners-refrigeration-parts/ac-part-1.jpg',
        stockQuantity: 50,
        specifications: {
          material: 'Brass',
          dimensions: '1/4 inch SAE',
          weight: '120g',
          finish: 'Nickel Plated'
        }
      },
      {
        name: 'Refrigeration Brass Fitting',
        description: 'Specialized brass fitting for refrigeration lines. Temperature and pressure resistant.',
        price: 48.75,
        category: 'Air Conditioners and Refigeration Parts',
        image: '/images/products/air-conditioners-refrigeration-parts/ac-part-2.jpg',
        stockQuantity: 65,
        specifications: {
          material: 'Brass',
          dimensions: '3/8 inch SAE',
          weight: '95g',
          finish: 'Natural Brass'
        }
      },

      // Cable Gland Accessories
      {
        name: 'Brass Cable Gland M20',
        description: 'Premium brass cable gland with excellent sealing properties. IP68 rated.',
        price: 25.99,
        category: 'cable gland accessories',
        image: '/images/products/cable-gland-accessories/cable-gland-1.jpg',
        stockQuantity: 110,
        specifications: {
          material: 'Brass',
          dimensions: 'M20 x 1.5',
          weight: '45g',
          finish: 'Nickel Plated'
        }
      },
      {
        name: 'Cable Gland Lock Nut Brass',
        description: 'Brass lock nut for cable gland installations. Secure and durable connection.',
        price: 12.50,
        category: 'cable gland accessories',
        image: '/images/products/cable-gland-accessories/cable-gland-2.jpg',
        stockQuantity: 180,
        specifications: {
          material: 'Brass',
          dimensions: 'M25 x 1.5',
          weight: '28g',
          finish: 'Natural Brass'
        }
      }
    ];
    
    const products = await Product.insertMany(realProducts);
    
    console.log('✅ Real products seeded:', products.length);
    
    res.status(201).json({
      success: true,
      message: `${products.length} products created successfully with real images`,
      products
    });
  } catch (error) {
    console.error('⚠️ Seed products error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error seeding products with images' 
    });
  }
});

// ✅ SEED SAMPLE PRODUCTS (for testing)
router.post('/seed', async (req, res) => {
  try {
    // Check if products already exist
    const existingProducts = await Product.countDocuments();
    if (existingProducts > 0) {
      return res.status(400).json({
        success: false,
        message: 'Products already seeded'
      });
    }
    
    const sampleProducts = [
      {
        name: 'Brass Cable Gland M20',
        description: 'High-quality brass cable gland suitable for industrial applications. Provides excellent protection against dust and moisture.',
        price: 25.99,
        category: 'Brass Cable Glands',
        image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop',
        stockQuantity: 100,
        specifications: {
          material: 'Brass',
          dimensions: 'M20 x 1.5',
          weight: '45g',
          finish: 'Nickel Plated'
        }
      },
      {
        name: 'Brass Cable Gland M16',
        description: 'Compact brass cable gland perfect for smaller cable installations. Features durable construction and easy installation.',
        price: 18.50,
        category: 'Brass Cable Glands',
        image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop',
        stockQuantity: 150,
        specifications: {
          material: 'Brass',
          dimensions: 'M16 x 1.5',
          weight: '32g',
          finish: 'Natural Brass'
        }
      },
      {
        name: 'Electrical Terminal Block',
        description: 'Reliable electrical terminal block for secure wire connections. Suitable for various electrical applications.',
        price: 12.75,
        category: 'Electrical Components',
        image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=300&fit=crop',
        stockQuantity: 200,
        specifications: {
          material: 'Brass/Copper',
          dimensions: '10x8x15mm',
          weight: '15g',
          finish: 'Tin Plated'
        }
      },
      {
        name: 'Brass Hex Head Screw M8',
        description: 'Premium brass hex head screws with superior corrosion resistance. Ideal for marine and outdoor applications.',
        price: 3.25,
        category: 'Brass Screws & Fittings',
        image: 'https://images.unsplash.com/photo-1609205807107-e8ec2120f9de?w=400&h=300&fit=crop',
        stockQuantity: 500,
        specifications: {
          material: 'Brass',
          dimensions: 'M8 x 25mm',
          weight: '8g',
          finish: 'Natural Brass'
        }
      },
      {
        name: 'Custom Brass Fitting',
        description: 'Precision-manufactured custom brass fitting designed to meet specific industrial requirements.',
        price: 45.00,
        category: 'Custom Parts',
        image: 'https://images.unsplash.com/photo-1581093804475-577d72e38aa0?w=400&h=300&fit=crop',
        stockQuantity: 50,
        specifications: {
          material: 'Brass',
          dimensions: 'Custom',
          weight: 'Varies',
          finish: 'Polished'
        }
      },
      {
        name: 'Brass Cable Gland M25',
        description: 'Heavy-duty brass cable gland for large cable installations. Exceptional durability and weather resistance.',
        price: 35.99,
        category: 'Brass Cable Glands',
        image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop',
        stockQuantity: 75,
        specifications: {
          material: 'Brass',
          dimensions: 'M25 x 1.5',
          weight: '68g',
          finish: 'Nickel Plated'
        }
      }
    ];
    
    const products = await Product.insertMany(sampleProducts);
    
    console.log('✅ Sample products seeded:', products.length);
    
    res.status(201).json({
      success: true,
      message: `${products.length} sample products created successfully`,
      products
    });
  } catch (error) {
    console.error('⚠️ Seed products error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error seeding products' 
    });
  }
});

module.exports = router;
