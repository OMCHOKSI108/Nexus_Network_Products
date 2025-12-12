const axios = require('axios');

async function testRegistration() {
  try {
    console.log("🧪 Testing registration with a new email...");
    
    const response = await axios.post('http://localhost:5000/api/users/register', {
      username: 'testuser',
      email: 'test@example.com',
      password: 'testpassword'
    });
    
    console.log("✅ Registration successful!");
    console.log("Response:", response.data);
    
  } catch (error) {
    console.log("❌ Registration failed!");
    console.log("Error:", error.response?.data || error.message);
  }
}

testRegistration();
