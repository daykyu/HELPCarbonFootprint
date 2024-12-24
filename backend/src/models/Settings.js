const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  profile: {
    avatar: {
      type: String,
      default: '/profile.png'
    }
  },
  security: {
    passwordExpiry: {
      type: Number,
      default: 90
    },
    mfaRequired: {
      type: Boolean,
      default: true
    },
    sessionTimeout: {
      type: Number,
      default: 30
    }
  },
  system: {
    maintenanceMode: {
      type: Boolean,
      default: false
    },
    automaticBackup: {
      type: Boolean,
      default: true
    },
    systemLogs: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Settings', settingsSchema);