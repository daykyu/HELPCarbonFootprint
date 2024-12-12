// backend/src/models/Activity.js
const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  transportation: {
    type: {
      type: String,
      enum: ['car', 'bus', 'motorcycle', 'bicycle', 'walking'],
      required: true
    },
    distance: {
      type: Number,
      required: true,
      min: 0
    }
  },
  energy: {
    type: {
      type: String,
      enum: ['coal', 'natural_gas', 'solar', 'wind'],
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    }
  },
  dietary: {
    type: {
      type: String,
      enum: ['meat_heavy', 'balanced', 'vegetarian', 'vegan'],
      required: true
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Activity', activitySchema);