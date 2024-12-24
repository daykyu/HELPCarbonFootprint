// backend/src/models/Historical.js
const mongoose = require('mongoose');

const historicalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  footprint: {
    transportation: {
      type: Number,
      required: true,
      default: 0
    },
    energy: {
      type: Number,
      required: true,
      default: 0
    },
    dietary: {
      type: Number,
      required: true,
      default: 0
    },
    total: {
      type: Number,
      required: true,
      default: 0
    }
  },
  milestones: [{
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    achieved: {
      type: Boolean,
      default: false
    },
    achievedDate: {
      type: Date,
      default: null
    },
    acknowledged: {
      type: Boolean,
      default: false
    }
  }],
  sustainabilityGoals: [{
    text: {
      type: String,
      required: true
    },
    target: {
      type: Number,
      required: true
    },
    current: {
      type: Number,
      default: 0
    },
    completed: {
      type: Boolean,
      default: false
    },
    completedDate: {
      type: Date,
      default: null
    }
  }],
  trackingData: [{
    date: {
      type: Date,
      required: true
    },
    transportation: {
      type: Number,
      default: 0
    },
    energy: {
      type: Number,
      default: 0
    },
    dietary: {
      type: Number,
      default: 0
    }
  }]
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for getting total emission reduction percentage
historicalSchema.virtual('totalReduction').get(function() {
  if (!this.trackingData || this.trackingData.length < 2) return 0;
  
  const firstEntry = this.trackingData[0];
  const lastEntry = this.trackingData[this.trackingData.length - 1];
  
  const firstTotal = firstEntry.transportation + firstEntry.energy + firstEntry.dietary;
  const lastTotal = lastEntry.transportation + lastEntry.energy + lastEntry.dietary;
  
  if (firstTotal === 0) return 0;
  return ((firstTotal - lastTotal) / firstTotal) * 100;
});

// Method to add new tracking data
historicalSchema.methods.addTrackingData = function(newData) {
  this.trackingData.push(newData);
  return this.save();
};

// Method to check milestone achievements
historicalSchema.methods.checkMilestones = function() {
  this.milestones.forEach(milestone => {
    if (!milestone.achieved) {
      switch(milestone.name) {
        case 'First Week Complete':
          if (this.trackingData.length >= 7) {
            milestone.achieved = true;
            milestone.achievedDate = new Date();
          }
          break;
        case '10% Reduction':
          if (this.totalReduction >= 10) {
            milestone.achieved = true;
            milestone.achievedDate = new Date();
          }
          break;
        case 'Consistent Logger':
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          const consistentLogs = this.trackingData.filter(data => 
            data.date >= thirtyDaysAgo
          ).length;
          if (consistentLogs >= 30) {
            milestone.achieved = true;
            milestone.achievedDate = new Date();
          }
          break;
      }
    }
  });
  return this.save();
};

// Method to update sustainability goals progress
historicalSchema.methods.updateGoalProgress = function(goalId, progress) {
  const goal = this.sustainabilityGoals.id(goalId);
  if (goal) {
    goal.current = progress;
    if (progress >= goal.target && !goal.completed) {
      goal.completed = true;
      goal.completedDate = new Date();
    }
  }
  return this.save();
};

// Pre-save middleware to calculate total footprint
historicalSchema.pre('save', function(next) {
  if (this.isModified('footprint')) {
    const { transportation, energy, dietary } = this.footprint;
    this.footprint.total = transportation + energy + dietary;
  }
  next();
});

module.exports = mongoose.model('Historical', historicalSchema);