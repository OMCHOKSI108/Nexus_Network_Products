/*
Simple script to apply `server/cloudinary-mapping.json` to existing Product documents.
Usage: node server/scripts/apply-cloudinary-mapping.js
It reads MONGODB_URI from environment or `.env` via dotenv.
*/

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const mappingPath = path.resolve(__dirname, '..', 'cloudinary-mapping.json');
if (!fs.existsSync(mappingPath)) {
  console.error('Mapping file not found at', mappingPath);
  process.exit(1);
}

const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));

const Product = require('../models/Product');

const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL || process.env.MONGO_URI;
if (!MONGODB_URI) {
  console.error('MONGODB_URI not set in environment (.env)');
  process.exit(1);
}

async function run() {
  try {
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    const products = await Product.find({});
    console.log('Found', products.length, 'products');

    let updated = 0;
    for (const p of products) {
      if (!p.image) continue;
      const keyCandidates = [p.image, p.image.replace(/^\//, '')];
      let newUrl = null;
      for (const k of keyCandidates) {
        if (mapping[k]) {
          newUrl = mapping[k];
          break;
        }
      }
      // Also try basename
      if (!newUrl) {
        const base = path.basename(p.image);
        if (mapping[base]) newUrl = mapping[base];
      }

      if (newUrl && newUrl !== p.image) {
        console.log(`Updating product ${p._id} image: ${p.image} -> ${newUrl}`);
        p.image = newUrl;
        await p.save();
        updated++;
      }
    }

    console.log('Update complete. Products updated:', updated);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
}

run();
