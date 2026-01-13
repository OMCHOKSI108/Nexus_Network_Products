const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Cart = require('./models/Cart');
const Order = require('./models/Order');

const newUsers = [
  {
    name: 'Om Choksi',
    username: 'Om Choksi',
    email: 'omchoksi99@gmail.com',
    password: 'password123' // Will be auto-hashed by User model
  },
  {
    name: 'Hacker Chief',
    username: 'Hacker Chief',
    email: 'hackerchief001@gmail.com',
    password: 'password123' // Will be auto-hashed by User model
  }
];

async function resetUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Step 1: Delete all existing users
    console.log('\n🗑️  Deleting all existing users...');
    const deletedUsers = await User.deleteMany({});
    console.log(`   Deleted ${deletedUsers.deletedCount} users`);

    // Step 2: Delete all carts and orders (to maintain data integrity)
    console.log('\n🗑️  Cleaning up carts and orders...');
    const deletedCarts = await Cart.deleteMany({});
    const deletedOrders = await Order.deleteMany({});
    console.log(`   Deleted ${deletedCarts.deletedCount} carts`);
    console.log(`   Deleted ${deletedOrders.deletedCount} orders`);

    // Step 3: Create new users
    console.log('\n👤 Creating new users...');
    console.log('='.repeat(60));

    for (const userData of newUsers) {
      // Create user (password will be auto-hashed by the model's pre-save hook)
      const user = new User({
        name: userData.name,
        username: userData.username,
        email: userData.email,
        password: userData.password, // Don't hash here - model will do it
        isActive: true,
        emailVerified: true
      });

      await user.save();

      console.log(`\n✅ Created user: ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Username: ${user.username}`);
      console.log(`   User ID: ${user._id}`);
      console.log(`   Password: ${userData.password} (please change after first login)`);

      // Create empty cart for user
      const cart = new Cart({
        userId: user._id,
        items: [],
        totalAmount: 0,
        totalItems: 0
      });
      await cart.save();
      console.log(`   Cart created: ${cart._id}`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('\n✅ User reset completed successfully!');
    console.log('\n📝 Login credentials:');
    newUsers.forEach(u => {
      console.log(`   ${u.email} / ${u.password}`);
    });

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

resetUsers();
