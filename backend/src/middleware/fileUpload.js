// middleware/fileUpload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure directories exist
const createUploadDirs = () => {
  const dirs = ['uploads/educational-content', 'uploads/thumbnails'];
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

createUploadDirs();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dest = file.fieldname === 'thumbnail' 
      ? 'uploads/thumbnails'
      : 'uploads/educational-content';
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'thumbnail') {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Thumbnail must be an image file'));
    }
    return cb(null, true);
  }

  const category = req.body.category;
  if (!category) {
    return cb(new Error('Category is required'));
  }

  switch (category) {
    case 'videos':
      if (!file.mimetype.startsWith('video/')) {
        return cb(new Error('Invalid video file type'));
      }
      break;
    case 'articles':
      if (![
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ].includes(file.mimetype)) {
        return cb(new Error('Invalid document file type'));
      }
      break;
    case 'infographics':
      if (!file.mimetype.startsWith('image/')) {
        return cb(new Error('Invalid image file type'));
      }
      break;
    default:
      return cb(new Error('Invalid category'));
  }
  cb(null, true);
};

// middleware/fileUpload.js
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  }
}).fields([
  { name: 'file', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]);

// Wrap multer middleware dengan error handling
exports.uploadContent = (req, res, next) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({
        success: false,
        message: err.code === 'LIMIT_FILE_SIZE' 
          ? 'File is too large' 
          : err.message
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    next();
  });
};
