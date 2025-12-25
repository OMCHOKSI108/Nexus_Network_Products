const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

// Comprehensive image mapping from database paths to actual filenames
const imageMapping = {
  // Brass Fittings
  '/images/products/brass-fitting/brass-fitting-1.jpg': '/images/products/Brass Cross Fitting.jpg',
  '/images/products/brass-fitting/brass-fitting-2.jpg': '/images/products/Brass Elbow Fitting (Male-Female).jpg',
  '/images/products/brass-fitting/brass-fitting-3.jpg': '/images/products/Brass Hose Connector.jpg',
  '/images/products/brass-fitting/brass-fitting-4.jpg': '/images/products/Brass Hose Fitting.jpg',
  '/images/products/brass-fitting/brass-fitting-5.jpg': '/images/products/Brass Reducer Bush.jpg',
  '/images/products/brass-fitting/brass-fitting-6.jpg': '/images/products/Brass Straight Barbed Connector.jpg',
  '/images/products/brass-fitting/brass-fitting-7.jpg': '/images/products/Brass Tee Fitting.jpeg',
  '/images/products/brass-fitting/brass-fitting-8.jpg': '/images/products/Brass Y-Type Barbed Connector.jpg',
  '/images/products/brass-fitting/brass-fitting-9.jpg': '/images/products/Brass Elbow Fitting.jpeg',

  // Brass Inserts
  '/images/products/brass-insert/brass-insert-1.jpg': '/images/products/Brass Adapter Bushing.webp',
  '/images/products/brass-insert/brass-insert-2.jpg': '/images/products/Brass Hex Reducer Bushing.jpg',
  '/images/products/brass-insert/brass-insert-3.jpg': '/images/products/Brass Knurled Insert.jpg',
  '/images/products/brass-insert/brass-insert-4.jpg': '/images/products/Brass Slotted Insert.jpg',
  '/images/products/brass-insert/brass-insert-5.jpg': '/images/products/Brass Stopping Plug.jpg',
  '/images/products/brass-insert/brass-insert-6.jpg': '/images/products/Brass Thread Enlarger Adaptor.avif',

  // Panumatic Parts
  '/images/products/panumatic-part/panumatic-part-1.jpg': '/images/products/Brass Cross Fitting.jpg',
  '/images/products/panumatic-part/panumatic-part-2.jpg': '/images/products/Brass Cross Fitting (Female Threaded).avif',
  '/images/products/panumatic-part/panumatic-part-3.jpg': '/images/products/Brass Female Thread x Hose Barb Adapter.jpg',
  '/images/products/panumatic-part/panumatic-part-4.jpg': '/images/products/Brass Foot Valve Strainer.avif',
  '/images/products/panumatic-part/panumatic-part-5.jpg': '/images/products/Brass Hose Barb Elbow.jpg',
  '/images/products/panumatic-part/panumatic-part-6.jpg': '/images/products/Brass Hose Barb Splicer.jpeg',
  '/images/products/panumatic-part/panumatic-part-7.jpg': '/images/products/Brass Jet Nozzle.jpg',
  '/images/products/panumatic-part/panumatic-part-8.jpg': '/images/products/Brass Jet Spray Nozzle Housing .jpg',
  '/images/products/panumatic-part/panumatic-part-9.jpg': '/images/products/Brass Male Elbow.jpg',
  '/images/products/panumatic-part/panumatic-part-10.jpg': '/images/products/Brass Pipe Nipple.webp',

  // Pressure Gauge Parts
  '/images/products/pressure-gauge-parts/pressure-gauge-1.jpg': '/images/products/Adapter Temp Gauge.jpg',
  '/images/products/pressure-gauge-parts/pressure-gauge-2.jpg': '/images/products/Brass Water Temperature Gauge.avif',
  '/images/products/pressure-gauge-parts/pressure-gauge-3.jpg': '/images/products/Coolant Temperature Gauge Sender.jpg',
  '/images/products/pressure-gauge-parts/pressure-gauge-4.jpg': '/images/products/Gauge Adapter Fitting.jpg',
  '/images/products/pressure-gauge-parts/pressure-gauge-5.jpg': '/images/products/Mini Pressure Gauge.avif',
  '/images/products/pressure-gauge-parts/pressure-gauge-6.jpg': '/images/products/Oil Pressure Gauge Hose Fitting .jpg',
  '/images/products/pressure-gauge-parts/pressure-gauge-7.jpg': '/images/products/Oil Temperature Sensor .jpg',
  '/images/products/pressure-gauge-parts/pressure-gauge-8.jpg': '/images/products/Pressure Gauge Connection .jpg',
  '/images/products/pressure-gauge-parts/pressure-gauge-9.jpg': '/images/products/Sensor Installation Fitting.jpeg',
  '/images/products/pressure-gauge-parts/pressure-gauge-10.jpg': '/images/products/Water Temperature Sensor Switch.jpg',

  // Cable Gland Accessories
  '/images/products/cable-gland-accessories/cable-gland-1.jpg': '/images/products/Cable Lugs.webp',
  '/images/products/cable-gland-accessories/cable-gland-2.jpg': '/images/products/Double Compression Gland (NPT2).jpg',
  '/images/products/cable-gland-accessories/cable-gland-3.jpg': '/images/products/Double Compression Gland (NPT3) .avif',
  '/images/products/cable-gland-accessories/cable-gland-4.jpg': '/images/products/Double Compression Gland .webp',
  '/images/products/cable-gland-accessories/cable-gland-5.jpg': '/images/products/Earthing Rods.webp',
  '/images/products/cable-gland-accessories/cable-gland-6.jpg': '/images/products/Single Compression Gland (M40-2).avif',

  // Air Conditioners and Refrigeration Parts
  '/images/products/air-conditioners-refrigeration/air-conditioner-1.jpg': '/images/products/air conditioner and refrigerator.jpg',
  '/images/products/air-conditioners-refrigeration/air-conditioner-2.jpg': '/images/products/Air Valve Adapter.jpg',
  '/images/products/air-conditioners-refrigeration/air-conditioner-3.jpg': '/images/products/panumatic parts.jpg',
  '/images/products/air-conditioners-refrigeration/air-conditioner-4.jpg': '/images/products/presaure gauge parts.jpg',
  '/images/products/air-conditioners-refrigeration/air-conditioner-5.jpg': '/images/products/cable and accessories.jpg',
};

async function fixImagePaths() {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/NexusNetwork';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    const products = await Product.find({});
    console.log(`Found ${products.length} products to check`);

    let updatedCount = 0;
    for (const product of products) {
      if (product.image && imageMapping[product.image]) {
        console.log(`Updating ${product.name}:`);
        console.log(`  From: ${product.image}`);
        console.log(`  To: ${imageMapping[product.image]}`);
        product.image = imageMapping[product.image];
        await product.save();
        updatedCount++;
      } else if (product.image && product.image.startsWith('/images/products/')) {
        // If no mapping exists, use a fallback image
        console.log(`No mapping for ${product.name}: ${product.image} - using fallback`);
        product.image = '/images/products/Brass Cross Fitting.jpg'; // fallback
        await product.save();
        updatedCount++;
      }
    }

    console.log(`\n✅ Updated ${updatedCount} product image paths`);
    console.log('Run this script on your production database too!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing image paths:', error);
    process.exit(1);
  }
}

fixImagePaths();