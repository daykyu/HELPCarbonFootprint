require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const compression = require('compression');
const User = require('./models/User');
const connectDB = require('./config/db');

// Import routes
const userRoutes = require('./routes/userRoutes');
const activityRoutes = require('./routes/activityRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const contentRoutes = require('./routes/contentRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const historicalRoutes = require('./routes/historicalRoutes');

const app = express();

// Create default admin user
const createDefaultAdmin = async () => {
  try {
    const adminExists = await User.findOne({ email: 'admin123@gmail.com' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        username: 'admin',
        email: 'admin123@gmail.com',
        password: hashedPassword,
        phone: '123456789',
        role: 'admin'
      });
      console.log('Default admin created');
    }
  } catch (error) {
    console.error('Error creating default admin:', error);
  }
};

// Inisialisasi direktori upload
const uploadDirs = [
  path.join(__dirname, 'uploads'),
  path.join(__dirname, 'uploads/educational-content'),
  path.join(__dirname, 'uploads/thumbnails'),
  path.join(__dirname, 'uploads/temp'),
  path.join(__dirname, 'uploads/profile')
];

const initializeUploadDirs = () => {
  uploadDirs.forEach(dir => {
    if (!require('fs').existsSync(dir)) {
      require('fs').mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  });
};

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(compression());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(morgan('dev'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', limiter);

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/activities', dashboardRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/admin/settings', settingsRoutes);
app.use('/api/historical', historicalRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the API' });
});

// Error handlers
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  
  if (req.files) {
    Object.values(req.files).forEach(files => {
      files.forEach(file => {
        require('fs').unlink(file.path, (unlinkErr) => {
          if (unlinkErr) console.error('Error deleting file:', unlinkErr);
        });
      });
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Something went wrong!',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Initialize server
const PORT = process.env.PORT || 5000;
const startServer = async () => {
  try {
    // Connect to MongoDB first
    await connectDB();
    console.log('MongoDB connected successfully');

    // Create upload directories
    initializeUploadDirs();

    // Create default admin after DB connection
    await createDefaultAdmin();

    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start server
startServer();

// Handle errors
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error('Error:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error('Error:', err);
  process.exit(1);
});