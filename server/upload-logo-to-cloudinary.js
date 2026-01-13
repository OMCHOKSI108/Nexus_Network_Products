const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function uploadLogo() {
  try {
    // Check environment variables
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error('❌ Missing Cloudinary credentials!');
      console.log('\nPlease add to your .env file:');
      console.log('CLOUDINARY_CLOUD_NAME=your_cloud_name');
      console.log('CLOUDINARY_API_KEY=your_api_key');
      console.log('CLOUDINARY_API_SECRET=your_api_secret');
      console.log('\nCurrent status:');
      console.log('  CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? '✅ SET' : '❌ NOT SET');
      console.log('  CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? '✅ SET' : '❌ NOT SET');
      console.log('  CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? '✅ SET' : '❌ NOT SET');
      return;
    }

    const logoPath = path.join(__dirname, '../frontend/public/img0.png');
    
    console.log('📤 Uploading logo to Cloudinary...');
    console.log('   File:', logoPath);
    
    // Check if file exists
    if (!fs.existsSync(logoPath)) {
      throw new Error(`File not found: ${logoPath}`);
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(logoPath, {
      folder: 'nexus-network',
      public_id: 'logo',
      overwrite: true,
      resource_type: 'image',
      transformation: [
        { quality: 'auto', fetch_format: 'auto' }
      ]
    });

    console.log('\n✅ Upload successful!');
    console.log('=' .repeat(80));
    console.log('\nCloudinary URL:', result.secure_url);
    console.log('Public ID:', result.public_id);
    console.log('Format:', result.format);
    console.log('Size:', Math.round(result.bytes / 1024), 'KB');
    console.log('Dimensions:', `${result.width}x${result.height}`);
    console.log('\n' + '='.repeat(80));
    
    console.log('\n📝 Update your frontend config with this URL:');
    console.log(`\nconst LOGO_URL = "${result.secure_url}";\n`);
    
    return result.secure_url;

  } catch (error) {
    console.error('\n❌ Error uploading logo:', error.message);
    if (error.http_code) {
      console.error('HTTP Code:', error.http_code);
    }
  }
}

uploadLogo();
