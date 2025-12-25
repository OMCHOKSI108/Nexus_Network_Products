require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/Admin');

// Build MongoDB Atlas URI using env variables
const DB_USER = process.env.DB_USER;
const DB_PASS = process.env.DB_PASS;
const DB_NAME = "NexusNetwork";
const DB_CLUSTER = process.env.DB_CLUSTER || "nexusnetwork.sz7r7g5";
const DB_APPNAME = process.env.DB_APPNAME || "NexusNetwork";

let mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017/NexusNetwork";
// Normalize scheme if user provided a host without scheme
if (!/^mongodb(?:\+srv)?:\/\//.test(mongoURI)) {
  mongoURI = 'mongodb://' + mongoURI;
}

async function seedAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: DB_NAME,
    });
    console.log('✅ Connected to MongoDB Atlas');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: 'omchoksi99@gmail.com' });
    if (existingAdmin) {
      console.log('ℹ️  Admin already exists');
      process.exit(0);
    }

    // Create the admin user
    const adminData = {
      name: 'Om Choksi',
      email: 'omchoksi99@gmail.com',
      password: 'admin@123',
      role: 'superadmin',
      isActive: true
    };

    const admin = new Admin(adminData);
    await admin.save();

    console.log('✅ Admin user created successfully');
    console.log('📧 Email: omchoksi99@gmail.com');
    console.log('🔐 Password: admin@123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admin:', error);
    process.exit(1);
  }
}

seedAdmin();