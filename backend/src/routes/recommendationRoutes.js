// /backend/src/routes/recommendationRoutes.js
const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/RecommendationController');
const auth = require('../middleware/auth');

// Get recommendations
router.get('/recommendations', auth, recommendationController.getRecommendations);

module.exports = router;