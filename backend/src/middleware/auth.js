const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
  try {
    // Debug logs
    console.log('Auth Headers:', req.headers);
    console.log('Authorization Header:', req.header('Authorization'));

    const authHeader = req.header('Authorization');
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Authorization header missing'
      });
    }

    // Pastikan format Bearer token benar
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token format'
      });
    }

    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authorization token required'
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.userId = decoded.userId;
      console.log('Decoded userId:', req.userId); // Debug log
      next();
    } catch (jwtError) {
      console.error('JWT Verification Error:', jwtError);
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error in auth middleware'
    });
  }
};

module.exports = auth;
