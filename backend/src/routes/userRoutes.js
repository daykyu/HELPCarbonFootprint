// backend/src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const { validateProfile } = require('../middleware/validation');

// Public routes
router.post('/register', validateProfile, userController.register);
router.post('/login', userController.login);

// Protected routes
router.get('/profile', auth, userController.getProfile);
router.put('/update-profile', auth, validateProfile, userController.updateProfile);



module.exports = router;