const adminCheck = (req, res, next) => {
  try {
    if (!req.userRole || req.userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error checking admin role'
    });
  }
};

module.exports = adminCheck;