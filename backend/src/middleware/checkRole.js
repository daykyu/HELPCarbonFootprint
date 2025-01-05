// middleware/checkRole.js
const adminCheck = (req, res, next) => {
  try {
    // req.user sudah di-set oleh middleware auth sebelumnya
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }
    next();
  } catch (error) {
    console.error('Admin check error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking admin privileges'
    });
  }
};

module.exports = adminCheck;
