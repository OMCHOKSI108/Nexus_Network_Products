const mongoose = require('mongoose');
const Product = require('./models/Product');

// Use a working connection
const MONGODB_URI = 'mongodb://localhost:27017/nexusnetwork';

// Mapping of actual image files that exist
const imageFileMap = {
  "cable-gland-accessories": [
    "cable-gland-1.jpg",
    "cable-gland-10.jpg", 
    "cable-gland-2.jpg",
    "cable-gland-3.JPG",    // Uppercase!
    "cable-gland-4.JPG",    // Uppercase!
    "cable-gland-5.JPG",    // Uppercase!
    "cable-gland-6.jpg",
    "cable-gland-7.jpg",
    "cable-gland-8.JPG",    // Uppercase!
    "cable-gland-9.JPG"     // Uppercase!
  ],
  "brass-fitting": [
    "brass-fitting-1.jpg",
    "brass-fitting-2.jpg",
    "brass-fitting-3.jpg", 
    "brass-fitting-4.jpg",
    "brass-fitting-5.jpg",
    "brass-fitting-6.jpg",
    "brass-fitting-7.png",   // PNG file!
    "brass-fitting-8.jpg",
    "brass-fitting-9.jpg"
  ]
};

async function fixImagePaths() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Fix cable gland accessories with uppercase .JPG extensions
    const cableGlandUpdates = [
      { productName: "Double Compression Gland (NPT3)", correctPath: "/images/products/cable-gland-accessories/cable-gland-3.JPG" },
      { productName: "Double Compression Gland (M25)", correctPath: "/images/products/cable-gland-accessories/cable-gland-4.JPG" },
      { productName: "Double Compression Gland", correctPath: "/images/products/cable-gland-accessories/cable-gland-5.JPG" },
      { productName: "Single Compression Gland (M32)", correctPath: "/images/products/cable-gland-accessories/cable-gland-8.JPG" },
      { productName: "Single Compression Gland (M20)", correctPath: "/images/products/cable-gland-accessories/cable-gland-9.JPG" }
    ];

    console.log('\n🔧 Fixing cable gland accessories image paths...');
    for (const update of cableGlandUpdates) {
      const result = await Product.updateOne(
        { name: update.productName },
        { imagePath: update.correctPath }
      );
      console.log(`✅ Updated ${update.productName}: ${result.modifiedCount} document(s) modified`);
    }

    // Verify the updates
    console.log('\n📋 Checking updated products:');
    const updatedProducts = await Product.find({
      category: 'cable-gland-accessories'
    }).select('name imagePath');

    updatedProducts.forEach(product => {
      console.log(`${product.name}: ${product.imagePath}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

fixImagePaths();
