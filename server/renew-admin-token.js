const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Utility script to generate a fresh admin token
 * Usage: node renew-admin-token.js <admin-email> <admin-id> [role]
 */

const args = process.argv.slice(2);
const email = args[0];
const adminId = args[1];
const role = args[2] || 'admin';

if (!email || !adminId) {
  console.log('❌ Usage: node renew-admin-token.js <admin-email> <admin-id> [role]');
  console.log('   Example: node renew-admin-token.js admin@example.com 507f1f77bcf86cd799439011 superadmin');
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.log('❌ JWT_SECRET not found in environment variables');
  process.exit(1);
}

try {
  // Generate new admin token (valid for 24 hours)
  const token = jwt.sign(
    { 
      id: adminId, 
      email: email,
      role: role,
      userType: 'admin'
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  console.log('✅ New admin token generated successfully!');
  console.log('📧 Email:', email);
  console.log('🆔 Admin ID:', adminId);
  console.log('👑 Role:', role);
  console.log('⏰ Expires in: 24 hours');
  console.log('\n🔐 Token:');
  console.log(token);
  console.log('\n📋 To use this token:');
  console.log('1. Copy the token above');
  console.log('2. Open browser developer tools');
  console.log('3. Go to Application/Storage tab');
  console.log('4. Find localStorage');
  console.log('5. Set adminToken = <paste token here>');
  console.log('6. Refresh the admin dashboard');

} catch (error) {
  console.error('❌ Error generating token:', error.message);
  process.exit(1);
}