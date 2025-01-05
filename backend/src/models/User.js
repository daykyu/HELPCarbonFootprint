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
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
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
  },
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Content'
  }],
  friends: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
});

userSchema.index({ email: 1 }, { unique: true });
userSchema.methods.isFriendWith = function(userId) {
  return this.friends && this.friends.includes(userId);
};

userSchema.methods.addFriend = function(friendId) {
  if (!this.friends) this.friends = [];
  if (!this.friends.includes(friendId)) {
    this.friends.push(friendId);
  }
  return this.save();
};

module.exports = mongoose.model('User', userSchema);