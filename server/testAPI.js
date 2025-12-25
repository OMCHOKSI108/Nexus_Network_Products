// const axios = require('axios');

// async function testRegistration() {
//   try {
//     console.log("🧪 Testing registration with a new email...");
    
//     const response = await axios.post('http://localhost:5000/api/users/register', {
//       username: 'testuser',
//       email: 'test@example.com',
//       password: 'testpassword'
//     });
    
//     console.log("✅ Registration successful!");
//     console.log("Response:", response.data);
    
//   } catch (error) {
//     console.log("❌ Registration failed!");
//     console.log("Error:", error.response?.data || error.message);
//   }
// }

// testRegistration();


const { MongoClient } = require('mongodb');
const uri = process.env.MONGODB_URI || 'mongodb+srv://omchoksi-user:rehman@cluster0.cesr8.mongodb.net/NexusNetwork?retryWrites=true&w=majority';
(async () => {
  try {
    const client = new MongoClient(uri);
    await client.connect();
    console.log('Mongo connected');
    await client.db().admin().ping();
    await client.close();
  } catch (e) {
    console.error('Mongo test error:', e);
  }
})();