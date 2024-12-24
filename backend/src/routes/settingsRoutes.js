const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { getSettings, updateSettings } = require('../controllers/settingsController');
const auth = require('../middleware/auth');
const adminCheck = require('../middleware/checkRole');

// Configure multer for avatar uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/avatars');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG and PNG are allowed.'));
    }
  }
});

router.use(auth);
router.use(adminCheck);

router.get('/', getSettings);
router.put('/', upload.single('avatar'), updateSettings);

module.exports = router;