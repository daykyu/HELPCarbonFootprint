// backend/src/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { createServer } = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const activityRoutes = require('./routes/activityRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const friendRoutes = require('./routes/friendRoutes');

const app = express();
const httpServer = createServer(app); // Tambahkan ini

// Connect to MongoDB
connectDB();

// Izinkan beberapa origin
const allowedOrigins = [
  'http://localhost:5173', // Vite dev server
  'http://localhost:3000',  // Jika masih diperlukan
  process.env.FRONTEND_URL
].filter(Boolean); // Hapus nilai falsy

const io = new Server(httpServer, {    // Tambahkan ini
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  }
});

// Konfigurasi CORS yang lebih spesifik
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
app.use(cors(corsOptions));
app.use(express.json());

const authenticateSocket = (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    const userId = socket.handshake.auth.userId;

    if (!token || !userId) {
      return next(new Error('Authentication required'));
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.userId !== userId) {
      return next(new Error('Invalid user authentication'));
    }

    // Attach user data to socket
    socket.user = decoded;
    socket.userId = userId;
    
    next();
  } catch (error) {
    console.error('Socket auth error:', error);
    next(new Error('Authentication failed'));
  }
};

io.use(authenticateSocket);


// Debug middleware
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
    socket.join(userId); // Join user's room
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
        id: Date.now().toString(), // Tambahkan id unik
        content,
        from: socket.userId,
        to,
        timestamp: new Date().toISOString()
      };
  
      // Emit ke pengirim dengan format yang sama
      socket.emit('private_message', message);
      
      // Emit ke penerima dengan format yang sama
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
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.IO server running on port ${PORT}`);
});