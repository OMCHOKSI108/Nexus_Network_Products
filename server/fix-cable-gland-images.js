const mongoose = require('mongoose');
const Product = require('./models/Product');

// MongoDB connection: prefer MONGODB_URI, otherwise build from env vars or use localhost
const DB_NAME = process.env.DB_NAME || 'NexusNetwork';
const MONGODB_URI = process.env.MONGODB_URI || (
  process.env.DB_USER && process.env.DB_PASS && process.env.DB_CLUSTER
    ? `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_CLUSTER}.mongodb.net/${DB_NAME}?retryWrites=true&w=majority&appName=${process.env.DB_APPNAME || 'NexusNetwork'}`
    : `mongodb://localhost:27017/${DB_NAME}`
);

async function fixCableGlandImages() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, dbName: DB_NAME });
    console.log('✅ Connected to MongoDB');

    // Products that need image path fixes based on actual file extensions
    const imageFixes = [
      // Cable gland accessories with .JPG (uppercase) files
      { 
        name: "Double Compression Gland (NPT2)", 
        currentPath: "/images/products/cable-gland-accessories/cable-gland-3.jpg",
        correctPath: "/images/products/cable-gland-accessories/cable-gland-3.JPG" 
      },
      { 
        name: "Double Compression Gland (NPT3)", 
        currentPath: "/images/products/cable-gland-accessories/cable-gland-4.jpg",
        correctPath: "/images/products/cable-gland-accessories/cable-gland-4.JPG" 
      },
      { 
        name: "Double Compression Gland", 
        currentPath: "/images/products/cable-gland-accessories/cable-gland-5.jpg",
        correctPath: "/images/products/cable-gland-accessories/cable-gland-5.JPG" 
      },
      { 
        name: "Single Compression Gland (M40-2)", 
        currentPath: "/images/products/cable-gland-accessories/cable-gland-8.jpg",
        correctPath: "/images/products/cable-gland-accessories/cable-gland-8.JPG" 
      },
      { 
        name: "Single Compression Gland", 
        currentPath: "/images/products/cable-gland-accessories/cable-gland-9.jpg",
        correctPath: "/images/products/cable-gland-accessories/cable-gland-9.JPG" 
      }
    ];

    console.log('\n🔧 Fixing cable gland accessories image paths...');
    
    for (const fix of imageFixes) {
      const result = await Product.updateOne(
        { name: fix.name, image: fix.currentPath },
        { image: fix.correctPath }
      );
      
      if (result.modifiedCount > 0) {
        console.log(`✅ Fixed ${fix.name}: .jpg → .JPG`);
      } else {
        console.log(`⚠️  ${fix.name}: No changes made (might already be correct)`);
      }
    }

    // Verify the updates
    console.log('\n📋 Checking updated cable gland accessories:');
    const cableGlandProducts = await Product.find({
      category: 'cable gland accessories'
    }).select('name image');

    cableGlandProducts.forEach(product => {
      const extension = product.image.split('.').pop();
      const status = ['JPG', 'png'].includes(extension) ? '✅' : '❌';
      console.log(`${status} ${product.name}: ${product.image}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

fixCableGlandImages();
