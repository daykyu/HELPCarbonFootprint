const Settings = require('../models/Settings');
const User = require('../models/User');
const fs = require('fs').promises;
const path = require('path');

exports.getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne({ userId: req.userId });
    const user = await User.findById(req.userId);

    if (!settings) {
      settings = await Settings.create({
        userId: req.userId,
        profile: {
          avatar: '/profile.png'
        }
      });
    }

    res.json({
      success: true,
      data: {
        profile: {
          username: user.username,
          email: user.email,
          phone: user.phone,
          avatar: settings.profile.avatar
        },
        security: settings.security,
        system: settings.system
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching settings',
      error: error.message
    });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const settings = await Settings.findOne({ userId: req.userId });
    const settingsData = JSON.parse(req.body.settings);

    // Handle avatar upload
    if (req.file) {
      // Delete old avatar if exists and not default
      if (settings.profile.avatar && settings.profile.avatar !== '/profile.png') {
        const oldAvatarPath = path.join(__dirname, '..', 'public', settings.profile.avatar);
        await fs.unlink(oldAvatarPath).catch(console.error);
      }
      settings.profile.avatar = `/uploads/avatars/${req.file.filename}`;
    }

    // Update security settings
    if (settingsData.security) {
      settings.security = {
        ...settings.security,
        ...settingsData.security
      };
    }

    // Update system settings
    if (settingsData.system) {
      settings.system = {
        ...settings.system,
        ...settingsData.system
      };
    }

    await settings.save();

    res.json({
      success: true,
      message: 'Settings updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating settings',
      error: error.message
    });
  }
};