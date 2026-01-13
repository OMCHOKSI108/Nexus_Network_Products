require('dotenv').config();
const { sendPasswordResetOTP, sendPasswordResetConfirmation } = require('./config/email');

async function testEmail() {
  console.log('📧 Testing email service...');
  console.log('EMAIL_USER:', process.env.EMAIL_USER);
  console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '***configured***' : 'NOT SET');
  
  try {
    console.log('\n🔐 Sending password reset OTP test email...');
    const result = await sendPasswordResetOTP('omchoksi99@gmail.com', '123456', 'Test User');
    console.log('✅ OTP Email sent successfully:', result);
    
    console.log('\n✉️ Sending password reset confirmation email...');
    const result2 = await sendPasswordResetConfirmation('omchoksi99@gmail.com', 'Test User');
    console.log('✅ Confirmation email sent successfully:', result2);
    
    console.log('\n🎉 All emails sent successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

testEmail();
