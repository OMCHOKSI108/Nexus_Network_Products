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

// CORS configuration: support comma-separated allowlist in CORS_ORIGIN
const rawCors = process.env.CORS_ORIGIN || 'http://localhost:5173';
const corsAllowlist = rawCors.split(',').map(s => s.trim()).filter(Boolean);
const corsOptions = {
  origin: function (origin, callback) {
    // allow non-browser or same-origin requests
    if (!origin) return callback(null, true);
    if (corsAllowlist.includes('*') || corsAllowlist.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  optionsSuccessStatus: 200
};
app.use((req, res, next) => {
  // Use CORS middleware but provide clearer debug when origin is blocked
  cors(corsOptions)(req, res, (err) => {
    if (err) {
      console.warn('CORS blocked origin:', req.headers.origin);
      res.status(403).send('CORS policy: This origin is not allowed');
      return;
    }
    next();
  });
});
app.use(express.json());

// Serve static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Add request logging
app.use((req, res, next) => {
  console.log(`📝 ${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});


// Build MongoDB Atlas URI using env variables
// const DB_USER = process.env.DB_USER;
// const DB_PASS = process.env.DB_PASS;
const DB_NAME = "NexusNetwork";
const DB_CLUSTER = process.env.DB_CLUSTER || "nexusnetwork.sz7r7g5";
const DB_APPNAME = process.env.DB_APPNAME || "NexusNetwork";

// Use provided MONGODB_URI or default to local MongoDB with scheme
let mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017/NexusNetwork";
// Ensure the connection string includes a valid scheme
if (!mongoURI.startsWith("mongodb://") && !mongoURI.startsWith("mongodb+srv://")) {
  mongoURI = "mongodb://" + mongoURI;
}
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

// Basic health endpoints
app.get('/', (req, res) => {
  res.status(200).send('API running');
});

app.get('/api', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Nexus Network API' });
});

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
