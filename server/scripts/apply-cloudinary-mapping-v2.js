/*
Improved mapping script:
- Loads `cloudinary-mapping.json`.
- Builds normalized key index from mapping basenames and mapping keys.
- For each Product, attempts to find a Cloudinary URL by:
  1. Exact match on image path.
  2. Match on basename (normalized).
  3. Match on product name slug -> mapping filename slug.
- Updates product.image to Cloudinary URL when a match is found.

Usage: node server/scripts/apply-cloudinary-mapping-v2.js
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
const rawMapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));

// Build normalized map: normalized basename -> url
function normalize(str) {
  return String(str || '')
    .toLowerCase()
    .replace(/\\.[^/.]+$/, '') // remove extension
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, '-');
}

const normMap = new Map();
for (const key of Object.keys(rawMapping)) {
  const url = rawMapping[key];
  const base = path.basename(key);
  const nb = normalize(base);
  if (nb) {
    if (!normMap.has(nb)) normMap.set(nb, url);
  }
  // also try normalized key without directories
  const keyNoDir = key.replace(/^\/+/, '').split('/').pop();
  const nk = normalize(keyNoDir);
  if (nk && !normMap.has(nk)) normMap.set(nk, url);
}

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

    let updated = 0; let matched = 0;
    for (const p of products) {
      const original = p.image || '';
      let newUrl = null;

      // 1) exact mapping
      if (original && rawMapping[original]) {
        newUrl = rawMapping[original];
      }

      // 2) try without leading /images or /uploads
      if (!newUrl && original) {
        let candidate = original.replace(/^\/+/, '');
        candidate = candidate.replace(/^images\//i, '');
        candidate = candidate.replace(/^uploads\//i, '');
        if (rawMapping[candidate]) newUrl = rawMapping[candidate];
      }

      // 3) by basename normalized
      if (!newUrl && original) {
        const base = path.basename(original);
        const nb = normalize(base);
        if (nb && normMap.has(nb)) {
          newUrl = normMap.get(nb);
        }
      }

      // 4) by product name normalized
      if (!newUrl) {
        const nameNorm = normalize(p.name || '');
        if (nameNorm && normMap.has(nameNorm)) {
          newUrl = normMap.get(nameNorm);
        }
      }

      if (newUrl && newUrl !== original) {
        console.log(`Updating product ${p._id} image: ${original} -> ${newUrl}`);
        p.image = newUrl;
        await p.save();
        updated++;
      }
      if (newUrl) matched++;
    }

    console.log('Scan complete. matched:', matched, 'updated:', updated);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

run();
