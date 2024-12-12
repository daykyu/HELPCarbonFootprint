// backend/src/routes/activityRoutes.js
const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const auth = require('../middleware/auth');

// Existing routes
router.post('/', auth, activityController.createActivity);
router.get('/', auth, activityController.getActivities);
router.get('/recent', auth, activityController.getRecentActivities);
router.get('/summary', auth, activityController.getActivitySummary);
router.get('/:date', auth, activityController.getActivityByDate);
router.delete('/:id', auth, activityController.deleteActivity);

module.exports = router;