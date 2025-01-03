// backend/src/controllers/userController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const generatePassword = require('../utils/generatePassword');

exports.register = async (req, res) => {
  try {
    const { username, email, phone, transportation, energy, dietary, reminderFrequency } = req.body;

    // Check existing user
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.email === email ? 'Email already registered' : 'Username already taken'
      });
    }

    // Generate default password
    const defaultPassword = generatePassword();
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // Create new user
    const user = new User({
      username,
      email,
      password: hashedPassword,
      phone,
      transportation,
      energy,
      dietary,
      reminderFrequency
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      defaultPassword,
      email
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

// backend/src/controllers/userController.js
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User with this email not found'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile'
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { username, phone, transportation, energy, dietary, reminderFrequency } = req.body;

    // Validate input
    if (!username || !phone || !reminderFrequency) {
      return res.status(400).json({
        success: false,
        message: 'Required fields are missing'
      });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User with this email not found'
      });
    }

    // Update user fields
    user.username = username;
    user.phone = phone;
    user.transportation = transportation;
    user.energy = energy;
    user.dietary = dietary;
    user.reminderFrequency = reminderFrequency;

    await user.save();

    // Send back updated user without password
    const updatedUser = await User.findById(req.userId).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
};