// backend/src/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const activityRoutes = require('./routes/activityRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const friendRoutes = require('./routes/friendRoutes');

const app = express();

// Connect to MongoDB
connectDB();

// Izinkan beberapa origin
const allowedOrigins = [
  'http://localhost:5173', // Vite dev server
  'http://localhost:3000',  // Jika masih diperlukan
  process.env.FRONTEND_URL
].filter(Boolean); // Hapus nilai falsy

// Konfigurasi CORS yang lebih spesifik
const corsOptions = {
  origin: function (origin, callback) {
    // Izinkan requests tanpa origin (seperti mobile apps atau Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Debug middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  console.log('Origin:', req.get('origin'));
  console.log('Headers:', req.headers);
  next();
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/activities', dashboardRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/friends', friendRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something broke!'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));