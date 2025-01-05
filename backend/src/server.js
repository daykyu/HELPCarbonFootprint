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
const jwt = require('jsonwebtoken');
const session = require('express-session');
const passport = require('passport');
const { createServer } = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

// Import routes
const userRoutes = require('./routes/userRoutes');
const activityRoutes = require('./routes/activityRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const contentRoutes = require('./routes/contentRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const historicalRoutes = require('./routes/historicalRoutes');
const friendRoutes = require('./routes/friendRoutes');
const facebookRoutes = require('./routes/facebookroutes');

const app = express();
const httpServer = createServer(app);

// Izinkan beberapa origin
const allowedOrigins = [
  'http://localhost:5173', 
  'http://localhost:3000',
  process.env.FRONTEND_URL,
  process.env.REACT_APP_API_URL
].filter(Boolean);

// Inisialisasi Socket.IO
const io = new Server(httpServer, {   
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  },
  pingTimeout: 60000
});

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

const corsOptions = {
  origin: function (origin, callback) {
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
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(compression());
app.use(cors(corsOptions));
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

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'lax'
  }
}));

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Socket.IO Authentication Middleware
const authenticateSocket = (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    const userId = socket.handshake.auth.userId;

    if (!token || !userId) {
      return next(new Error('Authentication required'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.userId !== userId) {
      return next(new Error('Invalid user authentication'));
    }

    socket.user = decoded;
    socket.userId = userId;
    next();
  } catch (error) {
    console.error('Socket auth error:', error);
    next(new Error('Authentication failed'));
  }
};

// Online users tracking
const onlineUsers = new Map();

// Socket.IO setup
const setupSocketIO = () => {
  io.use(authenticateSocket);

  io.on('connection', (socket) => {
    console.log('User connected:', socket.userId);

    // Add user to online users
    onlineUsers.set(socket.userId, socket.id);
    io.emit('users_online', Array.from(onlineUsers.keys()));

    // Join user's room
    socket.join(socket.userId);

    // Handle user connection
    socket.emit('connection_success', {
      userId: socket.userId,
      message: 'Successfully connected to socket server'
    });

    // Handle private messages
    socket.on('private_message', async (messageData, callback) => {
      try {
        if (!socket.user || !socket.userId) {
          throw new Error('User not authenticated');
        }

        const { to, content } = messageData;
        if (!to || !content) {
          throw new Error('Invalid message data');
        }

        const message = {
          id: Date.now().toString(),
          content,
          from: socket.userId,
          to,
          timestamp: new Date().toISOString()
        };

        // Send to sender
        socket.emit('private_message', message);

        // Send to recipient if online
        const recipientSocketId = onlineUsers.get(to);
        if (recipientSocketId) {
          io.to(recipientSocketId).emit('private_message', message);
        }

        callback({ success: true, message });
      } catch (error) {
        console.error('Message error:', error);
        callback({ success: false, error: error.message });
      }
    });

    // Typing indicators
    socket.on('typing', ({ to }) => {
      const recipientSocketId = onlineUsers.get(to);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('user_typing', {
          userId: socket.userId,
          username: socket.user?.name
        });
      }
    });

    socket.on('stop_typing', ({ to }) => {
      const recipientSocketId = onlineUsers.get(to);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('user_stop_typing', {
          userId: socket.userId
        });
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      if (socket.userId) {
        onlineUsers.delete(socket.userId);
        io.emit('user_offline', socket.userId);
        io.emit('users_online', Array.from(onlineUsers.keys()));
      }
      console.log('User disconnected:', socket.userId);
    });
  });
};

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
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/admin/settings', settingsRoutes);
app.use('/api/historical', historicalRoutes);
app.use('/api/friends', friendRoutes);
app.use('/auth/facebook', facebookRoutes);
app.use('/uploads', express.static('uploads'));

// User authentication check endpoint
app.get('/api/user', (req, res) => {
  if (req.user) {
    res.json({
      success: true,
      user: req.user
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Not authenticated'
    });
  }
});

// Welcome route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  // Clean up uploaded files if there's an error
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

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Server initialization
const PORT = process.env.PORT || 5000;
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log('MongoDB connected successfully');

    // Initialize upload directories
    initializeUploadDirs();

    // Create default admin
    await createDefaultAdmin();

    // Setup Socket.IO
    setupSocketIO();

    // Start HTTP server
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Socket.IO server running on port ${PORT}`);
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start server
startServer();

// Global error handlers
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
