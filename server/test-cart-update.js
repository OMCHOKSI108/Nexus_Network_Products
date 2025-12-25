const mongoose = require('mongoose');
const Cart = require('./models/Cart');
const Product = require('./models/Product');

// MongoDB connection: prefer MONGODB_URI, otherwise build from env vars or use localhost
const DB_NAME = process.env.DB_NAME || 'NexusNetwork';
const MONGODB_URI = process.env.MONGODB_URI || (
  process.env.DB_USER && process.env.DB_PASS && process.env.DB_CLUSTER
    ? `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_CLUSTER}.mongodb.net/${DB_NAME}?retryWrites=true&w=majority&appName=${process.env.DB_APPNAME || 'NexusNetwork'}`
    : `mongodb://localhost:27017/${DB_NAME}`
);

async function testCartUpdate() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, dbName: DB_NAME });
    console.log('✅ Connected to MongoDB');

    // Find any existing cart
    const cart = await Cart.findOne();
    if (!cart) {
      console.log('❌ No cart found in database');
      return;
    }

    console.log('\n📦 Current cart state:');
    console.log('Cart ID:', cart._id);
    console.log('Total Items:', cart.totalItems);
    console.log('Total Amount:', cart.totalAmount);
    console.log('Items:');
    cart.items.forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.productName} - Qty: ${item.quantity}, Price: ₹${item.productPrice}, Subtotal: ₹${item.subtotal}`);
    });

    if (cart.items.length > 0) {
      const firstItem = cart.items[0];
      const originalQuantity = firstItem.quantity;
      const newQuantity = originalQuantity + 1;
      
      console.log(`\n🔄 Testing quantity update for "${firstItem.productName}"`);
      console.log(`Original quantity: ${originalQuantity}`);
      console.log(`New quantity: ${newQuantity}`);
      
      // Update quantity
      await cart.updateItemQuantity(firstItem.productId, newQuantity);
      
      // Reload cart to see updated state
      const updatedCart = await Cart.findById(cart._id);
      
      console.log('\n✅ Updated cart state:');
      console.log('Total Items:', updatedCart.totalItems);
      console.log('Total Amount:', updatedCart.totalAmount);
      console.log('Items:');
      updatedCart.items.forEach((item, index) => {
        console.log(`  ${index + 1}. ${item.productName} - Qty: ${item.quantity}, Price: ₹${item.productPrice}, Subtotal: ₹${item.subtotal}`);
      });
      
      // Check if the update worked
      const updatedItem = updatedCart.items.find(item => item.productId.toString() === firstItem.productId.toString());
      if (updatedItem && updatedItem.quantity === newQuantity) {
        console.log('\n🎉 Cart update test PASSED');
      } else {
        console.log('\n❌ Cart update test FAILED');
        console.log('Expected quantity:', newQuantity);
        console.log('Actual quantity:', updatedItem ? updatedItem.quantity : 'Item not found');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

testCartUpdate();
