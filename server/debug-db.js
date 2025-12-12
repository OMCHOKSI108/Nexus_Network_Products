// Temporary database cleanup script
const mongoose = require("mongoose");
require("dotenv").config();

async function clearDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");
    
    // Get all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log("📋 Found collections:", collections.map(c => c.name));
    
    // Find users collection
    const User = require("./models/User");
    const userCount = await User.countDocuments();
    console.log(`👥 Total users in database: ${userCount}`);
    
    // List all users (be careful in production!)
    const users = await User.find({}, { email: 1, username: 1, createdAt: 1 });
    console.log("📧 Users in database:");
    users.forEach(user => {
      console.log(`  - ${user.email} (${user.username}) - Created: ${user.createdAt}`);
    });
    
    console.log("\n🔍 To remove all users (CAREFUL!), uncomment the next line:");
    // await User.deleteMany({});
    // console.log("🗑️ All users deleted");
    
  } catch (error) {
    console.error("❌ Database operation failed:", error);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Database connection closed");
    process.exit(0);
  }
}

clearDatabase();
