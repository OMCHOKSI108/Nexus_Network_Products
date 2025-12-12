const fs = require('fs');
const path = require('path');

// Base path to images
const baseImagePath = '../frontend/public/images/products';

// Categories to check
const categories = [
  'cable-gland-accessories',
  'brass-fitting', 
  'brass-insert',
  'air-conditioners-refrigeration-parts',
  'panumatic-part',
  'pressure-gauge-parts'
];

async function checkImageFiles() {
  console.log('🔍 Checking image files in all categories...\n');
  
  const imageMap = {};
  
  categories.forEach(category => {
    const categoryPath = path.join(__dirname, baseImagePath, category);
    console.log(`📁 Checking ${category}:`);
    
    try {
      const files = fs.readdirSync(categoryPath);
      imageMap[category] = files;
      
      files.forEach(file => {
        console.log(`   ${file}`);
      });
      console.log('');
    } catch (error) {
      console.log(`   ❌ Error reading directory: ${error.message}\n`);
    }
  });
  
  // Create mapping for database updates
  console.log('🔧 Image file mapping:');
  console.log(JSON.stringify(imageMap, null, 2));
}

checkImageFiles();
