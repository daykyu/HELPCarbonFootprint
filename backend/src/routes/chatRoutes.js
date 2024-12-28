const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Chat = require('../models/chat');

// Get chat history with a specific user
router.get('/history/:userId', auth, async (req, res) => {
    try {
        const chat = await Chat.findOne({
                participants: {
                    $all: [req.userId, req.params.userId]
                }
            })
            .populate('participants', 'name avatar')
            .populate('messages.sender', 'name avatar');

        res.json({
            success: true,
            chat
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get all chats for current user
router.get('/conversations', auth, async (req, res) => {
    try {
        const chats = await Chat.find({
                participants: req.userId
            })
            .populate('participants', 'name avatar')
            .sort({
                'messages.timestamp': -1
            });

        res.json({
            success: true,
            chats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;