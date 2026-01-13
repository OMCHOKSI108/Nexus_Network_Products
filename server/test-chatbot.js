/**
 * Test script for GROQ and RAG chatbot functionality
 * Run with: node test-chatbot.js
 */

require('dotenv').config();
const groqService = require('./services/groqService');
const ragService = require('./services/ragService');
const mongoose = require('mongoose');

async function testGroqConnection() {
  console.log('🧪 Testing GROQ API Connection...\n');
  
  try {
    const response = await groqService.chat([
      {
        role: 'system',
        content: 'You are a helpful assistant. Respond concisely.'
      },
      {
        role: 'user',
        content: 'Hello! Can you confirm you are working?'
      }
    ]);

    if (response.success) {
      console.log('✅ GROQ API is working!');
      console.log('📝 Response:', response.content);
      console.log('📊 Usage:', response.usage);
    } else {
      console.log('❌ GROQ API error:', response.error);
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

async function testRAGService() {
  console.log('\n🧪 Testing RAG Service...\n');

  // Connect to database
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/NexusNetwork';
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB\n');

    // Test product search
    console.log('🔍 Testing product search...');
    const products = await ragService.searchProducts('brass', 3);
    console.log(`✅ Found ${products.length} products`);
    if (products.length > 0) {
      console.log('   Sample:', products[0].name);
    }

    // Test context retrieval
    console.log('\n📋 Testing context retrieval...');
    const context = await ragService.getRelevantContext('show me brass fittings');
    console.log(`✅ Context retrieved:`);
    console.log(`   - Products: ${context.products.length}`);
    console.log(`   - Website: ${context.websiteInfo.name}`);

    // Test query classification
    console.log('\n🎯 Testing query classification...');
    const queries = [
      'show me products',
      'add to cart',
      'track my order',
      'what is your website about?'
    ];
    
    for (const query of queries) {
      const isProduct = ragService.isProductQuery(query);
      const isCart = ragService.isCartQuery(query);
      const isOrder = ragService.isOrderQuery(query);
      console.log(`   "${query}"`);
      console.log(`     Product: ${isProduct}, Cart: ${isCart}, Order: ${isOrder}`);
    }

    await mongoose.connection.close();
    console.log('\n✅ All RAG tests passed!');

  } catch (error) {
    console.error('❌ RAG test failed:', error.message);
  }
}

async function runTests() {
  console.log('🚀 Starting Chatbot System Tests\n');
  console.log('=' .repeat(50));
  
  await testGroqConnection();
  await testRAGService();
  
  console.log('\n' + '='.repeat(50));
  console.log('✨ Testing Complete!\n');
  process.exit(0);
}

runTests();
