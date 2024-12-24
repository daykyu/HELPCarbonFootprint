const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminCheck = require('../middleware/checkRole');
const { uploadContent: uploadMiddleware } = require('../middleware/fileUpload');
const {
  getAllContent,
  getContent,
  uploadContent,
  updateContent,
  deleteContent,
  toggleFavorite,
  getFavoriteContent
} = require('../controllers/contentController');

// Public routes (no auth required)
router.get('/public', getAllContent);
router.get('/public/:id', getContent);

// Apply auth middleware to all routes below
router.use(auth);

// User's favorite content routes
router.get('/favorites', getFavoriteContent);
router.post('/:id/favorite', toggleFavorite);

// Admin routes
router.get('/', adminCheck, getAllContent);
router.post('/', adminCheck, uploadMiddleware, uploadContent);
router.get('/:id', adminCheck, getContent);
router.put('/:id', adminCheck, uploadMiddleware, updateContent);
router.delete('/:id', adminCheck, deleteContent);

module.exports = router;