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


(function(){
  const { MongoClient } = require('mongodb');
  // Prefer explicit MONGODB_URI; fall back to local MongoDB for development
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/NexusNetwork';
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
})();
