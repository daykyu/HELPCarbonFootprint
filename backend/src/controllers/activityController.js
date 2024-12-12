// backend/src/controllers/activityController.js
const Activity = require('../models/Activity');
const { EMISSION_FACTORS } = require('../utils/emissionFactors');

const calculateActivityFootprint = (activity) => {
  if (!activity) {
    return {
      total: 0,
      breakdown: {
        transportation: 0,
        energy: 0,
        dietary: 0
      }
    };
  }

  // Menghitung transportation footprint
  let transFootprint = 0;
  if (activity.transportation && 
      activity.transportation.type && 
      EMISSION_FACTORS.transportation[activity.transportation.type]) {
    transFootprint = activity.transportation.distance * 
                    EMISSION_FACTORS.transportation[activity.transportation.type];
  }

  // Menghitung energy footprint
  let energyFootprint = 0;
  if (activity.energy && 
      activity.energy.type && 
      EMISSION_FACTORS.energy[activity.energy.type]) {
    energyFootprint = activity.energy.amount * 
                     EMISSION_FACTORS.energy[activity.energy.type];
  }

  // Menghitung dietary footprint
  let dietaryFootprint = 0;
  if (activity.dietary && 
      activity.dietary.type && 
      EMISSION_FACTORS.dietary[activity.dietary.type]) {
    dietaryFootprint = EMISSION_FACTORS.dietary[activity.dietary.type];
  }

  const total = transFootprint + energyFootprint + dietaryFootprint;

  return {
    total,
    breakdown: {
      transportation: transFootprint,
      energy: energyFootprint,
      dietary: dietaryFootprint
    }
  };
};

const createActivity = async (req, res) => {
  try {
    const { transportation, energy, dietary, date } = req.body;

    if (!transportation?.type || !transportation?.distance || 
        !energy?.type || !energy?.amount || 
        !dietary?.type || !date) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    const existingActivity = await Activity.findOne({
      userId: req.userId,
      date: new Date(date)
    });

    let activity;
    if (existingActivity) {
      existingActivity.transportation = transportation;
      existingActivity.energy = energy;
      existingActivity.dietary = dietary;
      activity = await existingActivity.save();
    } else {
      activity = await new Activity({
        userId: req.userId,
        date: new Date(date),
        transportation,
        energy,
        dietary
      }).save();
    }

    const footprint = calculateActivityFootprint(activity);

    res.status(existingActivity ? 200 : 201).json({
      success: true,
      message: `Activity log ${existingActivity ? 'updated' : 'created'} successfully`,
      activity,
      footprint
    });
  } catch (error) {
    console.error('Create activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create/update activity log',
      error: error.message
    });
  }
};

const getActivities = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const skip = (page - 1) * limit;

    const activities = await Activity.find({ userId: req.userId })
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Activity.countDocuments({ userId: req.userId });

    let totalFootprint = 0;
    const breakdown = {
      transportation: 0,
      energy: 0,
      dietary: 0
    };

    activities.forEach(activity => {
      const footprint = calculateActivityFootprint(activity);
      totalFootprint += footprint.total;
      breakdown.transportation += footprint.breakdown.transportation;
      breakdown.energy += footprint.breakdown.energy;
      breakdown.dietary += footprint.breakdown.dietary;
    });

    res.json({
      success: true,
      activities,
      footprint: { total: totalFootprint, breakdown },
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activities',
      error: error.message
    });
  }
};

const getActivityByDate = async (req, res) => {
  try {
    const date = new Date(req.params.date);
    const activity = await Activity.findOne({
      userId: req.userId,
      date: {
        $gte: new Date(date.setHours(0, 0, 0)),
        $lt: new Date(date.setHours(23, 59, 59))
      }
    });

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'No activity found for this date'
      });
    }

    const footprint = calculateActivityFootprint(activity);

    res.json({ success: true, activity, footprint });
  } catch (error) {
    console.error('Get activity by date error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activity',
      error: error.message
    });
  }
};

const deleteActivity = async (req, res) => {
  try {
    const activity = await Activity.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found or unauthorized'
      });
    }

    res.json({
      success: true,
      message: 'Activity deleted successfully'
    });
  } catch (error) {
    console.error('Delete activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete activity',
      error: error.message
    });
  }
};

const getRecentActivities = async (req, res) => {
  try {
    // Ambil 3 aktivitas terakhir
    const activities = await Activity.find({ userId: req.userId })
      .sort({ date: -1 })
      .limit(3);

    const formattedActivities = activities.map(activity => {
      const footprint = calculateActivityFootprint(activity);
      return {
        date: activity.date,
        transportation: {
          type: activity.transportation?.type,
          emissions: footprint.breakdown.transportation
        },
        energy: {
          type: activity.energy?.type,
          emissions: footprint.breakdown.energy
        },
        diet: {
          type: activity.dietary?.type,
          emissions: footprint.breakdown.dietary
        },
        totalEmissions: footprint.total
      };
    });

    res.json({
      success: true,
      activities: formattedActivities
    });
  } catch (error) {
    console.error('Get recent activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get recent activities',
      error: error.message
    });
  }
};

const getActivitySummary = async (req, res) => {
  try {
    // Ambil data 30 hari terakhir
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const activities = await Activity.find({
      userId: req.userId,
      date: { $gte: thirtyDaysAgo }
    }).sort({ date: -1 });

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

    if (activities.length > 0) {
      let totalEmissions = 0;
      const categoryTotals = {
        transportation: 0,
        energy: 0,
        diet: 0
      };

      // Hitung total emisi dan totals per kategori
      activities.forEach(activity => {
        const footprint = calculateActivityFootprint(activity);
        totalEmissions += footprint.total;
        categoryTotals.transportation += footprint.breakdown.transportation;
        categoryTotals.energy += footprint.breakdown.energy;
        categoryTotals.diet += footprint.breakdown.dietary;
      });

      // Hitung persentase untuk setiap kategori
      if (totalEmissions > 0) {
        summary.transportation.percentage = Math.round((categoryTotals.transportation / totalEmissions) * 100);
        summary.energy.percentage = Math.round((categoryTotals.energy / totalEmissions) * 100);
        summary.diet.percentage = Math.round((categoryTotals.diet / totalEmissions) * 100);
      }

      // Hitung trends berdasarkan perbandingan minggu ini vs minggu lalu
      ['transportation', 'energy', 'diet'].forEach(category => {
        const recentWeek = activities.slice(0, 7);
        const previousWeek = activities.slice(7, 14);

        if (recentWeek.length && previousWeek.length) {
          const recentTotal = recentWeek.reduce((sum, activity) => {
            const footprint = calculateActivityFootprint(activity);
            return sum + (category === 'diet' ? 
              footprint.breakdown.dietary : 
              footprint.breakdown[category]);
          }, 0);

          const previousTotal = previousWeek.reduce((sum, activity) => {
            const footprint = calculateActivityFootprint(activity);
            return sum + (category === 'diet' ? 
              footprint.breakdown.dietary : 
              footprint.breakdown[category]);
          }, 0);

          trends[category].direction = 
            recentTotal < previousTotal ? 'decreasing' :
            recentTotal > previousTotal ? 'increasing' : 'stable';
        }
      });
    }

    res.json({
      success: true,
      summary,
      trends
    });
  } catch (error) {
    console.error('Get activity summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get activity summary',
      error: error.message
    });
  }
};

module.exports = {
  createActivity,
  getActivities,
  getActivityByDate,
  deleteActivity,
  calculateActivityFootprint,
  getRecentActivities,   
  getActivitySummary    
};