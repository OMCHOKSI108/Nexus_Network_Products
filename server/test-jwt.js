const { generateToken, verifyToken } = require('./utils/generateToken');
require('dotenv').config();

// Test JWT functionality
async function testJWT() {
  try {
    console.log('🔐 Testing JWT Authentication System...\n');
    
    // Test 1: JWT_SECRET exists
    console.log('1. Checking JWT_SECRET:');
    if (process.env.JWT_SECRET) {
      console.log('   ✅ JWT_SECRET is configured');
      console.log(`   📏 Length: ${process.env.JWT_SECRET.length} characters`);
    } else {
      console.log('   ❌ JWT_SECRET is missing!');
      return;
    }
    
    // Test 2: Token generation
    console.log('\n2. Testing token generation:');
    const testUserId = '60f7b1b5b5b5b5b5b5b5b5b5'; // Mock user ID
    const token = generateToken(testUserId);
    console.log('   ✅ Token generated successfully');
    console.log(`   🎫 Token: ${token.substring(0, 50)}...`);
    
    // Test 3: Token verification
    console.log('\n3. Testing token verification:');
    const decoded = verifyToken(token);
    console.log('   ✅ Token verified successfully');
    console.log(`   👤 User ID: ${decoded.userId}`);
    console.log(`   ⏰ Expires: ${new Date(decoded.exp * 1000).toLocaleString()}`);
    
    console.log('\n🎉 JWT Authentication system is working correctly!');
    
  } catch (error) {
    console.error('❌ JWT Test failed:', error.message);
  }
}

testJWT();
