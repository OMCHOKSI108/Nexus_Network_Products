const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const User = require('./models/User');

async function checkUserToken() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find all users
    const users = await User.find({}).select('name email role _id');
    
    console.log('\n📋 Current Users in Database:');
    console.log('=' .repeat(60));
    
    users.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.name || 'No Name'}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   User ID (_id): ${user._id}`);
      
      // Generate a token for this user
      const token = jwt.sign(
        { 
          _id: user._id.toString(),
          email: user.email,
          role: user.role 
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      console.log(`   Sample Token: ${token.substring(0, 50)}...`);
      
      // Decode it back to verify
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log(`   Token contains _id: ${decoded._id ? '✅ YES' : '❌ NO'}`);
      console.log(`   Decoded:`, decoded);
    });

    console.log('\n' + '='.repeat(60));
    console.log(`\nTotal users: ${users.length}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

checkUserToken();
