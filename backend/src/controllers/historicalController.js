// backend/src/controllers/historicalController.js
const Activity = require('../models/Activity');
const { calculateActivityFootprint } = require('./activityController');

// Get historical data
const getHistoricalData = async (req, res) => {
  try {
    const userId = req.userId;
    const { timeRange = 'day' } = req.query;

    // Calculate date range
    const endDate = new Date();
    let startDate = new Date();

    switch (timeRange) {
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'day':
      default:
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
    }

    const activities = await Activity.find({
      userId,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: 1 });

    // Transform activities with footprint calculations
    const historicalData = activities.map(activity => {
      const footprint = calculateActivityFootprint(activity);
      return {
        date: activity.date,
        transportation: footprint.breakdown.transportation,
        energy: footprint.breakdown.energy,
        dietary: footprint.breakdown.dietary,
        total: footprint.total
      };
    });

    // Calculate totals and percentages
    const totalEmissions = historicalData.reduce((sum, day) => sum + day.total, 0);
    const breakdown = {
      transportation: {
        total: historicalData.reduce((sum, day) => sum + day.transportation, 0),
        percentage: 0
      },
      energy: {
        total: historicalData.reduce((sum, day) => sum + day.energy, 0),
        percentage: 0
      },
      dietary: {
        total: historicalData.reduce((sum, day) => sum + day.dietary, 0),
        percentage: 0
      }
    };

    // Calculate percentages if there are emissions
    if (totalEmissions > 0) {
      breakdown.transportation.percentage = (breakdown.transportation.total / totalEmissions) * 100;
      breakdown.energy.percentage = (breakdown.energy.total / totalEmissions) * 100;
      breakdown.dietary.percentage = (breakdown.dietary.total / totalEmissions) * 100;
    }

    res.json({
      success: true,
      data: historicalData,
      summary: {
        totalEmissions,
        breakdown,
        timeRange,
        startDate,
        endDate
      }
    });
  } catch (error) {
    console.error('Error in getHistoricalData:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch historical data',
      error: error.message
    });
  }
};

// Get historical summary
const getHistoricalSummary = async (req, res) => {
  try {
    const userId = req.userId;

    // Get last 30 days of data
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const activities = await Activity.find({
      userId,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: -1 });

    const summary = {
      daysTracked: activities.length,
      totalEmissions: 0,
      dailyAverage: 0,
      trends: {
        transportation: 'stable',
        energy: 'stable',
        dietary: 'stable'
      }
    };

    const footprints = activities.map(activity => calculateActivityFootprint(activity));
    
    if (footprints.length > 0) {
      summary.totalEmissions = footprints.reduce((sum, fp) => sum + fp.total, 0);
      summary.dailyAverage = summary.totalEmissions / footprints.length;

      // Calculate trends
      const recent = footprints.slice(0, 7);
      const previous = footprints.slice(7, 14);

      if (recent.length && previous.length) {
        const categories = ['transportation', 'energy', 'dietary'];
        categories.forEach(category => {
          const recentAvg = recent.reduce((sum, fp) => sum + fp.breakdown[category], 0) / recent.length;
          const previousAvg = previous.reduce((sum, fp) => sum + fp.breakdown[category], 0) / previous.length;
          
          if (recentAvg < previousAvg * 0.95) {
            summary.trends[category] = 'decreasing';
          } else if (recentAvg > previousAvg * 1.05) {
            summary.trends[category] = 'increasing';
          }
        });
      }
    }

    res.json({
      success: true,
      summary
    });
  } catch (error) {
    console.error('Error in getHistoricalSummary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch historical summary',
      error: error.message
    });
  }
};

// Get milestones and goals
const getMilestones = async (req, res) => {
  try {
    const userId = req.userId;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const activities = await Activity.find({
      userId,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: -1 });

    const milestones = [
      { 
        id: 1, 
        name: 'First Week Complete',
        description: 'Complete your first week of tracking',
        achieved: activities.length >= 7,
        date: activities.length >= 7 ? activities[6].date : null
      },
      {
        id: 2,
        name: '10% Reduction Achieved',
        description: 'Reduce your carbon footprint by 10%',
        achieved: false,
        date: null
      },
      {
        id: 3,
        name: 'Consistent Logger',
        description: 'Log your activities for 30 days straight',
        achieved: activities.length >= 30,
        date: activities.length >= 30 ? activities[29].date : null
      }
    ];

    // Check 10% reduction
    if (activities.length >= 14) {
      const recent = activities.slice(0, 7);
      const previous = activities.slice(7, 14);
      
      const recentAvg = recent.reduce((sum, activity) => {
        const footprint = calculateActivityFootprint(activity);
        return sum + footprint.total;
      }, 0) / 7;

      const previousAvg = previous.reduce((sum, activity) => {
        const footprint = calculateActivityFootprint(activity);
        return sum + footprint.total;
      }, 0) / 7;

      if (recentAvg <= previousAvg * 0.9) {
        milestones[1].achieved = true;
        milestones[1].date = recent[0].date;
      }
    }

    // Get sustainability goals
    const sustainabilityGoals = [
      {
        id: 1,
        text: 'Reduce car usage by 10% in a week',
        target: 10,
        current: 0,
        completed: false
      },
      {
        id: 2,
        text: 'Reduce your carbon footprint by 5% in a week',
        target: 5,
        current: 0,
        completed: false
      },
      {
        id: 3,
        text: 'Use public transport, walk, or bike for a day',
        target: 1,
        current: 0,
        completed: false
      }
    ];

    // Check goals completion
    if (activities.length >= 7) {
      const weeklyActivities = activities.slice(0, 7);
      
      // Check car usage reduction
      const carUsage = weeklyActivities.filter(activity => 
        activity.transportation.type === 'car'
      ).length;
      
      sustainabilityGoals[0].current = 100 - ((carUsage / 7) * 100);
      sustainabilityGoals[0].completed = carUsage <= 6;

      // Check footprint reduction
      const recentAvg = weeklyActivities.reduce((sum, activity) => {
        const footprint = calculateActivityFootprint(activity);
        return sum + footprint.total;
      }, 0) / 7;

      const previousActivities = activities.slice(7, 14);
      if (previousActivities.length === 7) {
        const previousAvg = previousActivities.reduce((sum, activity) => {
          const footprint = calculateActivityFootprint(activity);
          return sum + footprint.total;
        }, 0) / 7;

        const reduction = ((previousAvg - recentAvg) / previousAvg) * 100;
        sustainabilityGoals[1].current = reduction;
        sustainabilityGoals[1].completed = reduction >= 5;
      }

      // Check eco-friendly transport
      const hasEcoDay = weeklyActivities.some(activity => 
        ['bicycle', 'walking', 'bus'].includes(activity.transportation.type)
      );
      
      sustainabilityGoals[2].current = hasEcoDay ? 1 : 0;
      sustainabilityGoals[2].completed = hasEcoDay;
    }

    res.json({
      success: true,
      milestones,
      sustainabilityGoals
    });
  } catch (error) {
    console.error('Error in getMilestones:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch milestones',
      error: error.message
    });
  }
};

// Export the functions
module.exports = {
  getHistoricalData,
  getHistoricalSummary,
  getMilestones
};