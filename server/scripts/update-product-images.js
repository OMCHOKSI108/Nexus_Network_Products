/*
  Migration script: replace product image paths with Cloudinary URLs
  - Reads server/cloudinary-mapping.json
  - Connects to MongoDB using MONGODB_URI from server/.env
  - Updates `image` and `images` fields (and common variants) on Product documents
  Usage: node server/scripts/update-product-images.js
*/

require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const Product = require('../models/Product');

async function loadMapping() {
  const mapPath = path.resolve(__dirname, '..', 'cloudinary-mapping.json');
  if (!fs.existsSync(mapPath)) return {};
  try {
    const raw = fs.readFileSync(mapPath, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to read mapping:', e);
    return {};
  }
}

function findMappingFor(value, mapping) {
  if (!value || typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (mapping[trimmed]) return mapping[trimmed];

  // try basename
  try {
    const base = path.basename(trimmed);
    if (mapping[base]) return mapping[base];
  } catch (e) {}

  // try leading slash form
  if (!trimmed.startsWith('/')) {
    const withSlash = '/' + trimmed;
    if (mapping[withSlash]) return mapping[withSlash];
  }

  // try decode URI
  try {
    const decoded = decodeURIComponent(trimmed);
    if (mapping[decoded]) return mapping[decoded];
    const base2 = path.basename(decoded);
    if (mapping[base2]) return mapping[base2];
  } catch (e) {}

  return null;
}

async function mapObjectImages(obj, mapping) {
  let changed = false;

  // common fields to check
  const fields = ['image', 'images', 'imageUrl', 'imageUrls', 'productImage', 'photo'];

  for (const f of fields) {
    if (obj[f]) {
      if (Array.isArray(obj[f])) {
        const newArr = obj[f].map(item => {
          if (typeof item === 'string') {
            const m = findMappingFor(item, mapping);
            return m || item;
          }
          return item;
        });
        if (JSON.stringify(newArr) !== JSON.stringify(obj[f])) {
          obj[f] = newArr;
          changed = true;
        }
      } else if (typeof obj[f] === 'string') {
        const m = findMappingFor(obj[f], mapping);
        if (m && m !== obj[f]) {
          obj[f] = m;
          changed = true;
        }
      }
    }
  }

  return changed;
}

async function run() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI || process.env.DATABASE_URL;
  if (!uri) {
    console.error('No MONGODB_URI found in server/.env — aborting.');
    process.exit(1);
  }

  console.log('Connecting to MongoDB...');
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected.');

  const mapping = await loadMapping();
  if (!mapping || Object.keys(mapping).length === 0) {
    console.warn('No cloudinary mapping found — nothing to do.');
    await mongoose.disconnect();
    return;
  }

  const products = await Product.find({});
  console.log(`Found ${products.length} products.`);

  let updatedCount = 0;
  for (const p of products) {
    const obj = p.toObject();
    const changed = await mapObjectImages(obj, mapping);
    if (changed) {
      // assign changed fields back
      for (const key of Object.keys(obj)) {
        p[key] = obj[key];
      }
      try {
        await p.save();
        updatedCount++;
        console.log('Updated product', p._id);
      } catch (e) {
        console.error('Failed to save product', p._id, e.message);
      }
    }
  }

  console.log(`Update complete — ${updatedCount} products modified.`);
  await mongoose.disconnect();
}

run().catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
});
