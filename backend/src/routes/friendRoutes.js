// backend/src/routes/friendRoutes.js
const express = require('express');
const router = express.Router();
const friendController = require('../controllers/friendController');
const auth = require('../middleware/auth');

// Pastikan semua route menggunakan middleware auth
router.use(auth);

router.post('/send-request', friendController.sendFriendRequest);
router.get('/pending-requests', auth, friendController.getPendingRequests);
router.put('/request/:requestId', friendController.respondToFriendRequest);

module.exports = router;
