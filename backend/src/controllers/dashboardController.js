// backend/src/controllers/dashboardController.js
const Activity = require('../models/Activity');
const { EMISSION_FACTORS, convertUnits } = require('../utils/emissionFactors');
const { calculateActivityFootprint } = require('./activityController');

const getDashboardData = async (req, res) => {
  try {
    const MALAYSIA_AVERAGE = 8.6; // tons CO2e/year
    const TARGET_2030 = 4.73;     // tons CO2e/year (45% reduction)
    const KG_TO_TONS = 1000;      // conversion factor

    // Get all activities
    const allActivities = await Activity.find({
      userId: req.userId
    }).sort({ date: -1 });

    // Get today's activity
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayActivity = allActivities.find(activity => 
      new Date(activity.date) >= today && new Date(activity.date) < tomorrow
    );

    // Calculate current daily footprint
    let currentDaily = { total: 0, breakdown: { transportation: 0, energy: 0, dietary: 0 } };
    if (todayActivity) {
      currentDaily = calculateActivityFootprint(todayActivity);
    }

    // Calculate projected annual
    let projectedAnnual = 0;
    let projectedUnit = 'kg CO2e/year'; // Default unit
    const breakdownAnnual = {
      transportation: 0,
      energy: 0,
      dietary: 0
    };

  // Perbaikan di bagian perhitungan projected annual
if (allActivities.length > 0) {
    const totalDays = allActivities.length;
    let totalFootprint = 0;
  
    allActivities.forEach(activity => {
      const footprint = calculateActivityFootprint(activity);
      totalFootprint += footprint.total;
      Object.keys(footprint.breakdown).forEach(key => {
        breakdownAnnual[key] += footprint.breakdown[key];
      });
    });
  
    // Calculate daily average and project to annual
    const dailyAverage = totalFootprint / totalDays;
    projectedAnnual = dailyAverage * 365;
  
    // Unit conversion logic
    if (projectedAnnual >= 1000) {
      // Convert to tons if >= 1000 kg
      projectedAnnual = projectedAnnual / 1000;
      projectedUnit = 'tons CO2e/year';
      
      Object.keys(breakdownAnnual).forEach(key => {
        breakdownAnnual[key] = (breakdownAnnual[key] / totalDays * 365) / 1000;
      });
    } else {
      // Keep as kg if < 1000 kg
      Object.keys(breakdownAnnual).forEach(key => {
        breakdownAnnual[key] = (breakdownAnnual[key] / totalDays * 365);
      });
      projectedUnit = 'kg CO2e/year';
    }
  }
    // Calculate target progress
    let progressPercentage = 0;
    if (projectedAnnual > 0) {
      const projectedInTons = projectedUnit === 'tons CO2e/year' ? 
        projectedAnnual : projectedAnnual / KG_TO_TONS;
      
      progressPercentage = Math.max(0, Math.min(100,
        ((MALAYSIA_AVERAGE - projectedInTons) / (MALAYSIA_AVERAGE - TARGET_2030)) * 100
      ));
    }

    const footprintData = {
      projected: {
        annual: Number(projectedAnnual.toFixed(2)),
        unit: projectedUnit,
        percentageOfAverage: Math.min(100, (projectedUnit === 'tons CO2e/year' ? 
          (projectedAnnual / MALAYSIA_AVERAGE) * 100 :
          (projectedAnnual / KG_TO_TONS / MALAYSIA_AVERAGE) * 100
        ))
      },
      current: {
        daily: Number(currentDaily.total.toFixed(2)),
        unit: 'kg CO2e/day',
        percentageOfTarget: Number(((currentDaily.total / ((TARGET_2030 * KG_TO_TONS) / 365)) * 100).toFixed(2))
      },
      target: {
        progress: Math.round(progressPercentage),
        average: MALAYSIA_AVERAGE,
        goal: TARGET_2030,
        unit: 'tons CO2e/year'
      },
      breakdown: {
        transportation: {
          annual: Number(breakdownAnnual.transportation.toFixed(2)),
          daily: Number(currentDaily.breakdown.transportation.toFixed(2)),
          percentage: Math.round((breakdownAnnual.transportation / projectedAnnual) * 100) || 0
        },
        energy: {
          annual: Number(breakdownAnnual.energy.toFixed(2)),
          daily: Number(currentDaily.breakdown.energy.toFixed(2)),
          percentage: Math.round((breakdownAnnual.energy / projectedAnnual) * 100) || 0
        },
        dietary: {
          annual: Number(breakdownAnnual.dietary.toFixed(2)),
          daily: Number(currentDaily.breakdown.dietary.toFixed(2)),
          percentage: Math.round((breakdownAnnual.dietary / projectedAnnual) * 100) || 0
        }
      }
    };

    const metadata = {
      daysTracked: allActivities.length,
      isFirstDay: allActivities.length === 1,
      lastUpdate: allActivities.length > 0 ? allActivities[0].date : null
    };

    res.json({
      success: true,
      insufficientData: allActivities.length === 0,
      footprint: footprintData,
      metadata
    });

  } catch (error) {
    console.error('Dashboard data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data',
      error: error.message
    });
  }
};

module.exports = {
  getDashboardData
};