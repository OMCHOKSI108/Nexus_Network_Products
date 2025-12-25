#!/usr/bin/env node
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');
const { v2: cloudinary } = require('cloudinary');

// Configure Cloudinary via CLOUDINARY_URL or env vars
if (!process.env.CLOUDINARY_URL && !(process.env.CLOUDNARIY_API && process.env.CLOUDNARIY_SECRET && process.env.CLOUDNAME)) {
  console.error('Missing Cloudinary credentials in .env (CLOUDINARY_URL or CLOUDNARIY_API/CLOUDNARIY_SECRET/CLOUDNAME).');
  process.exit(1);
}

cloudinary.config({
  cloud_name: process.env.CLOUDNAME || process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDNARIY_API || process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDNARIY_SECRET || process.env.CLOUDINARY_API_SECRET,
});

const localImagesDir = path.join(__dirname, '..', '..', 'frontend', 'public', 'products');
const outMapping = path.join(__dirname, '..', 'cloudinary-mapping.json');

async function walk(dir) {
  const entries = await fs.promises.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const sub = await walk(full);
      files.push(...sub);
    } else if (/\.(jpe?g|png|webp|avif|gif|svg)$/i.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

async function uploadAll() {
  if (!fs.existsSync(localImagesDir)) {
    console.error('Images directory not found:', localImagesDir);
    process.exit(1);
  }

  const files = await walk(localImagesDir);
  if (!files.length) {
    console.log('No image files found under', localImagesDir);
    return;
  }

  const mapping = {};
  console.log(`Found ${files.length} images — starting upload to Cloudinary...`);

  for (const file of files) {
    const rel = path.relative(path.join(__dirname, '..', '..', 'frontend', 'public'), file).replace(/\\/g, '/');
    try {
      const remotePath = rel.replace(/^products\//, 'products/');
      const publicId = `nexus/${remotePath.replace(/\.[^.]+$/, '')}`.replace(/[^a-zA-Z0-9_\/-]/g, '_');
      const res = await cloudinary.uploader.upload(file, { public_id: publicId, overwrite: false, resource_type: 'image' });
      mapping['/' + rel] = res.secure_url;
      mapping[path.basename(file)] = res.secure_url;
      console.log('Uploaded', rel, '->', res.secure_url);
    } catch (err) {
      console.error('Upload failed for', file, err.message || err);
    }
  }

  await fs.promises.writeFile(outMapping, JSON.stringify(mapping, null, 2));
  console.log('Upload complete. Mapping written to', outMapping);
}

uploadAll().catch(err => {
  console.error('Unexpected error during upload:', err);
  process.exit(1);
});
// end of upload script
