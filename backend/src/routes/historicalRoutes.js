// backend/src/routes/historicalRoutes.js
const express = require('express');
const router = express.Router();
const historicalController = require('../controllers/historicalController');
const auth = require('../middleware/auth');

// Get historical data
router.get('/data', auth, historicalController.getHistoricalData);

// Get historical summary
router.get('/summary', auth, historicalController.getHistoricalSummary);

// Get milestones and goals
router.get('/milestones', auth, historicalController.getMilestones);

module.exports = router;