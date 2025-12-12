const mongoose = require('mongoose');
const Product = require('./models/Product');

const MONGODB_URI = 'mongodb+srv://artist:Artist@cluster0.vkvlkj0.mongodb.net/?appName=Cluster0';

async function checkProducts() {
  try {
    console.log('🔌 Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');

    const products = await Product.find({}).select('name imagePath category');
    console.log(`\n📦 Found ${products.length} products\n`);

    // Check for products that might have image issues
    const imageIssues = [];
    
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   Category: ${product.category}`);
      console.log(`   Image: ${product.imagePath}`);
      
      // Check for potential issues
      if (!product.imagePath) {
        imageIssues.push(`${product.name} - No image path`);
      } else if (product.imagePath.includes('.jpg') || product.imagePath.includes('.JPG')) {
        imageIssues.push(`${product.name} - Using .jpg extension`);
      }
      console.log('');
    });

    if (imageIssues.length > 0) {
      console.log('\n🚨 Potential image issues:');
      imageIssues.forEach(issue => console.log(`- ${issue}`));
    } else {
      console.log('\n✅ All products have image paths configured');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

checkProducts();
