const checkRole = (role) => {
    return (req, res, next) => {
      if (req.userRole !== role) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
      next();
    };
  };
  
  module.exports = checkRole;