const path = require('path');
const fs = require('fs');
const { v2: cloudinary } = require('cloudinary');

// Configure via CLOUDINARY_URL or individual vars (also accept legacy/misspelled names)
const configFromEnv = (() => {
  if (process.env.CLOUDINARY_URL) return { url: process.env.CLOUDINARY_URL };

  // prefer standard names
  const key = process.env.CLOUDINARY_API_KEY || process.env.CLOUDNARIY_API || process.env.CLOUDNARIY_API_KEY;
  const secret = process.env.CLOUDINARY_API_SECRET || process.env.CLOUDNARIY_SECRET || process.env.CLOUDNARIY_API_SECRET;
  const name = process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDNAME || process.env.CLOUDNARIY_NAME;

  if (key && secret && name) return { cloud_name: name, api_key: key, api_secret: secret };
  return null;
})();

if (!configFromEnv) {
  console.warn('No Cloudinary credentials found in env. Set CLOUDINARY_URL or CLOUDINARY_API_KEY/CLOUDINARY_API_SECRET/CLOUDINARY_CLOUD_NAME');
} else {
  // Configure cloudinary explicitly
  try {
    if (configFromEnv.url) {
      cloudinary.config({ secure: true });
      // cloudinary.v2 will pick up CLOUDINARY_URL automatically, but we log for clarity
      console.log('Using CLOUDINARY_URL from environment.');
    } else {
      cloudinary.config(configFromEnv);
      // Mask api_key/secret for logging
      const maskedKey = String(configFromEnv.api_key).slice(-4).padStart(Math.max(4, String(configFromEnv.api_key).length), '*');
      console.log(`Configured Cloudinary with cloud_name='${configFromEnv.cloud_name}', api_key='${maskedKey}'`);
    }
  } catch (err) {
    console.warn('Warning: error while configuring cloudinary:', err.message || err);
  }
}

async function uploadLogo() {
  const localPath = path.resolve(__dirname, '..', '..', 'frontend', 'public', 'img0.png');
  if (!fs.existsSync(localPath)) {
    console.error('Local logo not found at', localPath);
    process.exit(1);
  }

  try {
    console.log('Uploading', localPath, 'to Cloudinary...');
    const res = await cloudinary.uploader.upload(localPath, {
      folder: process.env.CLOUDINARY_LOGO_FOLDER || 'nexus/logo',
      public_id: process.env.CLOUDINARY_LOGO_PUBLIC_ID || 'img0',
      overwrite: true,
      resource_type: 'image'
    });
    console.log('Upload successful. URL:', res.secure_url);
    console.log('You can set VITE_CLOUDINARY_LOGO in frontend to:', res.secure_url);
  } catch (err) {
    console.error('Upload failed:', err.message || err);
    process.exit(1);
  }
}

if (require.main === module) {
  uploadLogo();
}
