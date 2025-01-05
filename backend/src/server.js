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

// Izinkan beberapa origin
const allowedOrigins = [
  'http://localhost:5173', 
  'http://localhost:3000',
  process.env.FRONTEND_URL
].filter(Boolean); 


const io = new Server(httpServer, {   
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  }
});


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
app.use(cors(corsOptions));
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// Inisialisasi Passport
app.use(passport.initialize());
app.use(passport.session());


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

io.use(authenticateSocket);



app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  console.log('Origin:', req.get('origin'));
  console.log('Headers:', req.headers);
  next();
});

// Menyimpan user yang online
const onlineUsers = new Map();

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  const userId = socket.handshake.auth.userId;

  if (!token || !userId) {
    return next(new Error('Authentication required'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.userId !== userId) {
      return next(new Error('Invalid user authentication'));
    }

    socket.user = decoded;
    socket.userId = userId;
    next();
  } catch (error) {
    next(new Error('Authentication failed: ' + error.message));
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.userId);

  // Handle user_connected event
  socket.on('user_connected', ({ userId }) => {
    socket.join(userId); 
    io.emit('user_online', userId);
  });

  // Handle private messages
  socket.on('private_message', async (messageData, callback) => {
    try {
      if (!socket.user || !socket.userId) {
        throw new Error('User not authenticated');
      }
  
      const { to, content } = messageData;
      
      const message = {
        id: Date.now().toString(), 
        content,
        from: socket.userId,
        to,
        timestamp: new Date().toISOString()
      };
  
     
      socket.emit('private_message', message);
      
      socket.to(to).emit('private_message', message);
      
      callback({ success: true, message });
      
    } catch (error) {
      console.error('Message error:', error);
      callback({ error: error.message });
    }
  });
  
  
  socket.on('typing', ({ to }) => {
    const recipientSocketId = onlineUsers.get(to);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('user_typing', {
        userId: socket.user.id,
        username: socket.user.name
      });
    }
  });

  socket.on('stop_typing', ({ to }) => {
    const recipientSocketId = onlineUsers.get(to);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('stop_typing', {
        userId: socket.user.id
      });
    }
  });

  socket.on('connect', () => {
    console.log('Connected with ID:', socket.id);
    console.log('User data:', socket.user);
  });

  socket.on('disconnect', () => {
    if (socket.user) {
      onlineUsers.delete(socket.user.id);
      io.emit('user_offline', socket.user.id);
    }
    console.log('User disconnected:', socket.id);
  });
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


// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something broke!'
  });
});

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

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.IO server running on port ${PORT}`);
});