const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { uploadContent } = require('../middleware/fileUpload');
const contentController = require('../controllers/contentController');

const adminCheck = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  next();
};

// Public routes
router.get('/public', contentController.getAllContent);
router.get('/public/:id', contentController.getContent);

// Protected routes
router.use(auth);

// Admin routes - Added GET route for admin dashboard
router.get('/', contentController.getAllContent); // New route for admin dashboard
router.post('/', adminCheck, uploadContent, contentController.uploadContent);
router.get('/:id', adminCheck, contentController.getContent);
router.put('/:id', adminCheck, uploadContent, contentController.updateContent);
router.delete('/:id', adminCheck, contentController.deleteContent);

// User routes
router.post('/:id/favorite', contentController.toggleFavorite);

module.exports = router;