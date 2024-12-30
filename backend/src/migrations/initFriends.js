// backend/src/migrations/initFriends.js
const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config(); // Pastikan untuk load environment variables

async function initializeFriendsArray() {
  try {
    // Connect ke database
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Connected to MongoDB...');

    // Jalankan migrasi
    await User.updateMany(
      { friends: { $exists: false } },
      { $set: { friends: [] } }
    );

    console.log('Successfully initialized friends array for all users');
  } catch (error) {
    console.error('Error initializing friends array:', error);
  } finally {
    // Tutup koneksi database
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
}

// Jalankan migrasi
initializeFriendsArray();
