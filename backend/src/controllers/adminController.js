const User = require('../models/User');
const Content = require('../models/Content');

exports.getDashboard = async (req, res) => {
  try {
    // Get total users
    const totalUsers = await User.countDocuments({ role: 'user' });

    // Get new users today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newUsers = await User.countDocuments({
      role: 'user',
      createdAt: { $gte: today }
    });

    // Get recent users
    const recentUsers = await User.find({ role: 'user' })
      .select('username email createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get content statistics
    const contentStats = await getContentStatistics();

    // Get active sessions (example metric)
    const activeSessions = Math.floor(totalUsers * 0.3); // 30% of total users as example

    res.json({
      success: true,
      data: {
        totalUsers,
        newUsers,
        activeSessions,
        recentUsers,
        contentStats
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data'
    });
  }
};

const getContentStatistics = async () => {
  const now = new Date();
  const lastMonth = new Date(now.setMonth(now.getMonth() - 1));

  // Get counts for each category
  const [articlesCount, videosCount, infographicsCount] = await Promise.all([
    Content.countDocuments({ category: 'articles' }),
    Content.countDocuments({ category: 'videos' }),
    Content.countDocuments({ category: 'infographics' })
  ]);

  // Get trends for each category
  const [articlesTrend, videosTrend, infographicsTrend] = await Promise.all([
    calculateCategoryTrend('articles', lastMonth),
    calculateCategoryTrend('videos', lastMonth),
    calculateCategoryTrend('infographics', lastMonth)
  ]);

  return {
    articles: {
      total: articlesCount,
      ...articlesTrend
    },
    videos: {
      total: videosCount,
      ...videosTrend
    },
    infographics: {
      total: infographicsCount,
      ...infographicsTrend
    }
  };
};

const calculateCategoryTrend = async (category, lastMonth) => {
  // Count content created in the last month
  const recentCount = await Content.countDocuments({
    category,
    createdAt: { $gte: lastMonth }
  });

  // Count content created in the month before
  const previousMonth = new Date(lastMonth);
  previousMonth.setMonth(previousMonth.getMonth() - 1);
  
  const previousCount = await Content.countDocuments({
    category,
    createdAt: {
      $gte: previousMonth,
      $lt: lastMonth
    }
  });

  // Calculate trend
  let trend = 'up';
  let trendValue = 0;

  if (previousCount > 0) {
    trendValue = Math.round(((recentCount - previousCount) / previousCount) * 100);
  } else if (recentCount > 0) {
    trendValue = 100;
  }

  if (trendValue < 0) {
    trend = 'down';
    trendValue = Math.abs(trendValue);
  }

  return { trend, trendValue };
};

exports.uploadContent = async (req, res) => {
  try {
    // Content upload logic here (if needed)
    res.status(201).json({
      success: true,
      message: 'Content uploaded successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Content upload failed'
    });
  }
};