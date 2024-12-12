// backend/src/controllers/RecommendationController.js
const Activity = require('../models/Activity');

const RecommendationController = {
  getRecommendations: async (req, res) => {
    try {
      // Verify user authentication
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      // Get user ID from authenticated request
      const userId = req.user.id;

      // Get recent activities (last 3)
      const recentActivities = await Activity.find({ userId })
        .sort({ date: -1 })
        .limit(3);

      // Calculate historical data for the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const monthlyActivities = await Activity.find({
        userId,
        date: { $gte: thirtyDaysAgo }
      }).sort({ date: -1 });

      // Initialize summary and trends objects
      const summary = {
        transportation: { percentage: 0 },
        energy: { percentage: 0 },
        diet: { percentage: 0 }
      };

      const trends = {
        transportation: { direction: 'stable' },
        energy: { direction: 'stable' },
        diet: { direction: 'stable' }
      };

      // Calculate percentages and trends if activities exist
      if (monthlyActivities.length > 0) {
        // Calculate total emissions
        const totalEmissions = monthlyActivities.reduce((sum, activity) => {
          return sum + (
            (activity.transportation?.emissions || 0) +
            (activity.energy?.emissions || 0) +
            (activity.diet?.emissions || 0)
          );
        }, 0);

        if (totalEmissions > 0) {
          // Calculate percentages and trends for each category
          ['transportation', 'energy', 'diet'].forEach(category => {
            // Calculate total emissions for this category
            const categoryEmissions = monthlyActivities.reduce((sum, activity) => 
              sum + (activity[category]?.emissions || 0), 0);

            // Calculate percentage
            summary[category].percentage = 
              Math.round((categoryEmissions / totalEmissions) * 100);

            // Calculate trend based on recent vs previous week
            const recentWeekEmissions = monthlyActivities
              .slice(0, 7)
              .reduce((sum, activity) => sum + (activity[category]?.emissions || 0), 0);

            const previousWeekEmissions = monthlyActivities
              .slice(7, 14)
              .reduce((sum, activity) => sum + (activity[category]?.emissions || 0), 0);

            // Determine trend direction
            if (recentWeekEmissions < previousWeekEmissions) {
              trends[category].direction = 'decreasing';
            } else if (recentWeekEmissions > previousWeekEmissions) {
              trends[category].direction = 'increasing';
            }
          });
        }
      }

      // Format response data
      const responseData = {
        activities: recentActivities.map(activity => ({
          date: activity.date,
          transportation: {
            type: activity.transportation?.type || 'none',
            emissions: activity.transportation?.emissions || 0
          },
          energy: {
            type: activity.energy?.type || 'none',
            emissions: activity.energy?.emissions || 0
          },
          diet: {
            type: activity.diet?.type || 'none',
            emissions: activity.diet?.emissions || 0
          }
        })),
        summary,
        trends
      };

      // Send successful response
      res.json({
        success: true,
        data: responseData
      });

    } catch (error) {
      console.error('Recommendations error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate recommendations'
      });
    }
  }
};

module.exports = RecommendationController;