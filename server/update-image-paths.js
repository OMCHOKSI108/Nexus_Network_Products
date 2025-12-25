const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

// Update image paths to use /products/ instead of /images/products/
async function updateImagePaths() {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/NexusNetwork';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    const products = await Product.find({});
    console.log(`Found ${products.length} products`);

    let updatedCount = 0;
    for (const product of products) {
      if (product.image && product.image.startsWith('/images/products/')) {
        const newPath = product.image.replace('/images/products/', '/products/');
        console.log(`Updating ${product.name}:`);
        console.log(`  From: ${product.image}`);
        console.log(`  To: ${newPath}`);
        product.image = newPath;
        await product.save();
        updatedCount++;
      }
    }

    console.log(`\n✅ Updated ${updatedCount} product image paths`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating image paths:', error);
    process.exit(1);
  }
}

updateImagePaths();