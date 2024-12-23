const User = require('../models/User');

exports.getDashboard = async (req, res) => {
  try {
    // Get admin dashboard data
    const totalUsers = await User.countDocuments({ role: 'user' });
    const recentUsers = await User.find({ role: 'user' })
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        totalUsers,
        recentUsers
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data'
    });
  }
};

exports.uploadContent = async (req, res) => {
  try {
    // Handle content upload logic here
    res.json({
      success: true,
      message: 'Content uploaded successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to upload content'
    });
  }
};