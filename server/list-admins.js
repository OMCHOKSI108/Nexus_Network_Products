require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/Admin');

// MongoDB connection
const DB_USER = process.env.DB_USER || 'admin';
const DB_PASS = process.env.DB_PASS || 'admin123';
const DB_CLUSTER = process.env.DB_CLUSTER || 'cluster0.nlwuuzx';
const DB_NAME = "NexusNetwork"; // Use the same DB name as seed-admin.js
const DB_APPNAME = process.env.DB_APPNAME || 'Cluster0';

const mongoURI = process.env.MONGODB_URI || "localhost:27017/NexusNetwork";

async function listAdmins() {
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: DB_NAME,
    });
    
    console.log("✅ Connected to MongoDB Atlas");
    
    const admins = await Admin.find({}, 'name email role isActive createdAt lastLogin').lean();
    
    if (admins.length === 0) {
      console.log('❌ No admin accounts found in database');
      console.log('💡 You may need to create an admin account first using seed-admin.js');
    } else {
      console.log(`📋 Found ${admins.length} admin account(s):`);
      console.log('');
      
      admins.forEach((admin, index) => {
        console.log(`${index + 1}. Admin Details:`);
        console.log(`   🆔 ID: ${admin._id}`);
        console.log(`   📧 Email: ${admin.email}`);
        console.log(`   👤 Name: ${admin.name || 'N/A'}`);
        console.log(`   👑 Role: ${admin.role}`);
        console.log(`   ✅ Active: ${admin.isActive ? 'Yes' : 'No'}`);
        console.log(`   📅 Created: ${admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : 'N/A'}`);
        console.log(`   🔑 Last Login: ${admin.lastLogin ? new Date(admin.lastLogin).toLocaleString() : 'Never'}`);
        console.log('');
        
        if (admin.isActive) {
          console.log(`   💡 To generate token for this admin, run:`);
          console.log(`   node renew-admin-token.js "${admin.email}" "${admin._id}" "${admin.role}"`);
          console.log('');
        }
      });
    }

  } catch (error) {
    console.error('❌ Error listing admins:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

listAdmins();