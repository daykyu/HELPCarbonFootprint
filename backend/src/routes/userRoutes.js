const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');
const { validateProfile } = require('../middleware/validation');

// Public routes
router.post('/register', validateProfile, userController.register);
router.post('/login', userController.login);

// Protected user routes
router.get('/profile', auth, userController.getProfile);
router.put('/update-profile', auth, validateProfile, userController.updateProfile);

// Admin routes
router.get('/admin/dashboard', auth, checkRole('admin'), adminController.getDashboard);
router.post('/admin/upload-content', auth, checkRole('admin'), adminController.uploadContent);

module.exports = router;