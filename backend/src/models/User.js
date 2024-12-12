// backend/src/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  transportation: {
    type: {
      type: String,
      enum: ['car', 'bus', 'motorcycle', 'bicycle', 'walking']
    },
    distance: {
      type: Number,
      default: 0
    }
  },
  energy: {
    type: {
      type: String,
      enum: ['coal', 'natural_gas', 'solar', 'wind']
    },
    amount: {
      type: Number,
      default: 0
    }
  },
  dietary: {
    type: {
      type: String,
      enum: ['meat_heavy', 'balanced', 'vegetarian', 'vegan']
    }
  },
  reminderFrequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    default: 'daily'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);