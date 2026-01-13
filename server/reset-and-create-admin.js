require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/Admin');
const User = require('./models/User');

// Build MongoDB Atlas URI using env variables
const DB_NAME = "NexusNetwork";
let mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017/NexusNetwork";

// Normalize scheme if user provided a host without scheme
if (!/^mongodb(?:\+srv)?:\/\//.test(mongoURI)) {
  mongoURI = 'mongodb://' + mongoURI;
}

async function resetAndCreateAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: DB_NAME,
    });
    console.log('✅ Connected to MongoDB');

    // Step 1: Delete ALL users
    console.log('\n🗑️  Deleting all users...');
    const deletedUsers = await User.deleteMany({});
    console.log(`✅ Deleted ${deletedUsers.deletedCount} users`);

    // Step 2: Delete ALL admins
    console.log('\n🗑️  Deleting all admins...');
    const deletedAdmins = await Admin.deleteMany({});
    console.log(`✅ Deleted ${deletedAdmins.deletedCount} admins`);

    // Step 3: Create the new admin user
    console.log('\n👤 Creating new admin...');
    const adminData = {
      name: 'Om Choksi',
      email: 'omchoksi99@gmail.com',
      password: 'OMchoksi#108',
      role: 'superadmin',
      isActive: true
    };

    const admin = new Admin(adminData);
    await admin.save();

    console.log('✅ Admin user created successfully!');
    console.log('\n📋 Admin Credentials:');
    console.log('   📧 Email: omchoksi99@gmail.com');
    console.log('   🔐 Password: OMchoksi#108');
    console.log('   👑 Role: superadmin');
    
    console.log('\n✨ Database reset complete! You can now login with the new admin credentials.');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
}

resetAndCreateAdmin();
