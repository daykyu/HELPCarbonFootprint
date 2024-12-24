const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const adminCheck = require('../middleware/checkRole');
const { validateProfile } = require('../middleware/validation');
const settingsController = require('../controllers/settingsController');

// Public routes
router.post('/register', validateProfile, userController.register);
router.post('/login', userController.login);

// Protected user routes
router.get('/profile', auth, userController.getProfile);
router.put('/update-profile', auth, validateProfile, userController.updateProfile);

// Admin routes
router.get('/admin/dashboard', auth, adminCheck, adminController.getDashboard);
router.get('/api/admin/settings', auth, adminCheck, settingsController.getSettings);
router.put('/api/admin/settings/:category', auth, adminCheck, settingsController.updateSettings);

module.exports = router;