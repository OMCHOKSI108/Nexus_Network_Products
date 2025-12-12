const mongoose = require('mongoose');
const Product = require('./models/Product');

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/NexusNetwork', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const imageExtensionFixes = {
  // Brass fitting fixes
  '/images/products/brass-fitting/brass-fitting-7.jpg': '/images/products/brass-fitting/brass-fitting-7.png',
  
  // Cable gland accessories fixes (JPG to jpg)
  '/images/products/cable-gland-accessories/cable-gland-3.jpg': '/images/products/cable-gland-accessories/cable-gland-3.JPG',
  '/images/products/cable-gland-accessories/cable-gland-4.jpg': '/images/products/cable-gland-accessories/cable-gland-4.JPG',
  '/images/products/cable-gland-accessories/cable-gland-5.jpg': '/images/products/cable-gland-accessories/cable-gland-5.JPG',
  '/images/products/cable-gland-accessories/cable-gland-8.jpg': '/images/products/cable-gland-accessories/cable-gland-8.JPG',
  '/images/products/cable-gland-accessories/cable-gland-9.jpg': '/images/products/cable-gland-accessories/cable-gland-9.JPG'
};

async function fixImageExtensions() {
  try {
    console.log('🔧 Fixing image file extensions...');
    
    for (const [oldPath, newPath] of Object.entries(imageExtensionFixes)) {
      const result = await Product.updateOne(
        { image: oldPath },
        { $set: { image: newPath } }
      );
      
      if (result.modifiedCount > 0) {
        console.log(`✅ Updated: ${oldPath} → ${newPath}`);
      }
    }
    
    console.log('🎉 All image extensions fixed!');
    
    // Verify all products have images
    const products = await Product.find({});
    console.log(`\n📊 Total products: ${products.length}`);
    
    const productsWithImages = products.filter(p => p.image && p.image.length > 0);
    console.log(`📸 Products with images: ${productsWithImages.length}`);
    
    if (products.length !== productsWithImages.length) {
      console.log('⚠️  Some products missing images:');
      const missingImages = products.filter(p => !p.image || p.image.length === 0);
      missingImages.forEach(p => console.log(`   - ${p.name}`));
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing extensions:', error);
    process.exit(1);
  }
}

fixImageExtensions();
