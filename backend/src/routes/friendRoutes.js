// backend/src/routes/friendRoutes.js
const express = require('express');
const router = express.Router();
const friendController = require('../controllers/friendController');
const auth = require('../middleware/auth');

// Pastikan semua route menggunakan middleware auth
router.use(auth);

router.post('/send-request', friendController.sendFriendRequest);
router.get('/pending-requests', auth, friendController.getPendingRequests);
// router.put('/request/:requestId', friendController.respondToFriendRequest);
// Di file route Anda
router.put('/request/:requestId',friendController.respondToFriendRequest);

// Route baru
router.get('/list', friendController.getFriendsList);
router.delete('/remove/:friendId', friendController.removeFriend);

// routes/friendRoutes.js
router.get('/request/:requestId/debug', auth, async (req, res) => {
    try {
      const { requestId } = req.params;
      const userId = req.userId;
  
      const friendRequest = await FriendRequest.findById(requestId);
      
      res.json({
        requestDetails: {
          id: friendRequest._id,
          receiver: friendRequest.receiver,
          sender: friendRequest.sender,
          status: friendRequest.status
        },
        currentUser: userId,
        isReceiver: friendRequest.receiver.toString() === userId
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  

module.exports = router;
