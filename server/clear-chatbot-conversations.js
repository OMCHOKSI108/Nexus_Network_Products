const mongoose = require('mongoose');
require('dotenv').config();

const Conversation = require('./models/Conversation');

async function clearConversations() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const result = await Conversation.deleteMany({});
    console.log(`\n🗑️  Deleted ${result.deletedCount} chatbot conversations`);

    console.log('✅ Chatbot conversations cleared!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

clearConversations();
