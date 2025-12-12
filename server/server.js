require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const authRoutes = require("./routes/userRoutes");
const cartRoutes = require("./routes/cartRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const adminAuthRoutes = require("./routes/adminAuthRoutes");
const adminRoutes = require("./routes/adminRoutes");
const contactRoutes = require("./routes/contactRoutes");

const app = express();

// CORS configuration for production
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());

// Serve static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Add request logging
app.use((req, res, next) => {
  console.log(`📝 ${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});


// Build MongoDB Atlas URI using env variables
const DB_USER = process.env.DB_USER;
const DB_PASS = process.env.DB_PASS;
const DB_NAME = "NexusNetwork";
const DB_CLUSTER = process.env.DB_CLUSTER || "nexusnetwork.sz7r7g5";
const DB_APPNAME = process.env.DB_APPNAME || "NexusNetwork";

// const mongoURI = process.env.MONGODB_URI || "localhost:27017/NexusNetwork";
const mongoURI = process.env.MONGODB_URI || "localhost:27017/NexusNetwork";
async function connectDB() {
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: DB_NAME,
    });
    console.log("✅ MongoDB Atlas connected");
  } catch (err) {
    console.error("❌ MongoDB Atlas connection error:", err);
    process.exit(1);
  }
}

connectDB();

// API Routes
app.use("/api/users", authRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/contact", contactRoutes);

const PORT = process.env.PORT || 3004;

// Global error handlers
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
