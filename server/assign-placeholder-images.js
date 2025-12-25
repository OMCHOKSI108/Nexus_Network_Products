require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

let mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/NexusNetwork';
if (!/^mongodb(?:\+srv)?:\/\//.test(mongoURI)) {
  mongoURI = 'mongodb://' + mongoURI;
}

async function assignPlaceholders() {
  try {
    await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    const products = await Product.find({});
    console.log(`Found ${products.length} products`);

    let updated = 0;
    for (const p of products) {
      // Only set placeholder if image is empty or points to a missing local path
      if (!p.image || p.image.trim() === '' || p.image.startsWith('/images')) {
        const placeholder = `https://via.placeholder.com/800x600?text=${encodeURIComponent(p.name)}`;
        p.image = placeholder;
        await p.save();
        updated++;
      }
    }

    console.log(`Updated ${updated} products with placeholder images.`);
    process.exit(0);
  } catch (err) {
    console.error('Error assigning placeholder images:', err);
    process.exit(1);
  }
}

assignPlaceholders();
