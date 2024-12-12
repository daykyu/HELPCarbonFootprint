// backend/src/routes/dashboardRoutes.js
const express = require('express');                
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const auth = require('../middleware/auth');

router.get('/dashboard', auth, dashboardController.getDashboardData);

module.exports = router;