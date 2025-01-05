// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    console.log('Auth Header:', authHeader); // Untuk debugging

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authorization header'
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded); // Untuk debugging

    const user = await User.findById(decoded.userId);
    console.log('Found user:', user); // Untuk debugging

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    req.user = user;
    req.userId = user._id;
    req.token = token;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({
      success: false,
      message: 'Authentication failed',
      error: error.message
    });
  }
};

module.exports = auth;
