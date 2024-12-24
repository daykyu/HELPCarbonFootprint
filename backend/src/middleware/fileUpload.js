const multer = require('multer');
const path = require('path');

// Storage configuration for content files
const contentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'thumbnail') {
      cb(null, 'src/uploads/thumbnails');
    } else {
      cb(null, 'src/uploads/educational-content');
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter configuration
const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'thumbnail') {
    // Allow only image files for thumbnails
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Only image files are allowed for thumbnails'), false);
    } else {
      cb(null, true);
    }
  } else {
    // Check file types based on content category
    const allowedTypes = {
      articles: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      videos: ['video/mp4', 'video/webm', 'video/x-msvideo'],
      infographics: ['image/jpeg', 'image/png', 'image/svg+xml']
    };

    if (!allowedTypes[req.body.category]?.includes(file.mimetype)) {
      cb(new Error(`Invalid file type for ${req.body.category}`), false);
    } else {
      cb(null, true);
    }
  }
};

// File size limits
const limits = {
  thumbnail: 2 * 1024 * 1024, // 2MB for thumbnails
  articles: 10 * 1024 * 1024,    // 10MB
  videos: 100 * 1024 * 1024,     // 100MB
  infographics: 5 * 1024 * 1024  // 5MB
};

// Configure multer upload
const upload = multer({
  storage: contentStorage,
  fileFilter,
  limits: {
    fileSize: (req, file) => {
      if (file.fieldname === 'thumbnail') {
        return limits.thumbnail;
      }
      return limits[req.body.category] || 5 * 1024 * 1024;
    }
  }
});

// Export the configured multer middleware
exports.uploadContent = upload.fields([
  { name: 'file', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]);