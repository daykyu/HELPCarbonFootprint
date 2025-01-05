// routes/contentRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Content = require('../models/Content');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Ensure upload directories exist
const uploadDirs = ['uploads/educational-content', 'uploads/thumbnails'];
uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure multer storage
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    if (file.fieldname === 'thumbnail') {
      cb(null, 'uploads/thumbnails');
    } else {
      cb(null, 'uploads/educational-content');
    }
  },
  filename: function(req, file, cb) {
    const prefix = file.fieldname === 'thumbnail' ? 'thumbnail-' : 'file-';
    cb(null, prefix + Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// GET endpoint untuk konten favorit
router.get('/favorites', auth, async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const user = await User.findById(req.userId).populate({
      path: 'favorites',
      populate: {
        path: 'createdBy',
        select: 'name email'
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const formattedFavorites = user.favorites.map(content => ({
      ...content.toObject(),
      thumbnailUrl: content.thumbnailUrl.startsWith('http')
        ? new URL(content.thumbnailUrl).pathname
        : content.thumbnailUrl,
      fileUrl: content.fileUrl.startsWith('http')
        ? new URL(content.fileUrl).pathname
        : content.fileUrl
    }));

    res.json({
      success: true,
      data: formattedFavorites
    });

  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching favorites',
      error: error.message
    });
  }
});

// POST endpoint untuk toggle favorite status
router.post('/:id/favorite', auth, async (req, res) => {
  try {
    const contentId = req.params.id;
    const userId = req.userId;

    // Cek apakah content exists
    const content = await Content.findById(contentId);
    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    // Cek user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Cek apakah content sudah di-favorite
    const favoriteIndex = user.favorites.indexOf(contentId);
    const isFavorited = favoriteIndex !== -1;

    if (isFavorited) {
      // Remove from favorites
      user.favorites.splice(favoriteIndex, 1);
    } else {
      // Add to favorites
      user.favorites.push(contentId);
    }

    await user.save();

    res.json({
      success: true,
      message: isFavorited ? 'Removed from favorites' : 'Added to favorites',
      isFavorited: !isFavorited
    });

  } catch (error) {
    console.error('Error toggling favorite:', error);
    res.status(500).json({
      success: false,
      message: 'Error toggling favorite',
      error: error.message
    });
  }
});

// POST endpoint untuk menambah/menghapus favorit
router.post('/favorites/:id', auth, async (req, res) => {
  try {
    const contentId = req.params.id;
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const content = await Content.findById(contentId);
    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    // Toggle favorite
    const isFavorited = user.favorites.includes(contentId);
    if (isFavorited) {
      // Remove from favorites
      user.favorites = user.favorites.filter(id => id.toString() !== contentId);
    } else {
      // Add to favorites
      user.favorites.push(contentId);
    }

    await user.save();

    res.json({
      success: true,
      message: isFavorited ? 'Removed from favorites' : 'Added to favorites',
      isFavorited: !isFavorited
    });

  } catch (error) {
    console.error('Error updating favorites:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating favorites',
      error: error.message
    });
  }
});

// Upload endpoint
router.post('/', 
  auth,
  upload.fields([
    { name: 'file', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      // Debug logs
      console.log('Request body:', req.body);
      console.log('Request files:', req.files);
      console.log('User ID:', req.userId);

      if (!req.files || !req.files.file || !req.files.thumbnail) {
        return res.status(400).json({
          success: false,
          message: 'Both file and thumbnail are required'
        });
      }

      // Create file URLs
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const fileUrl = `${baseUrl}/${req.files.file[0].path}`;
      const thumbnailUrl = `${baseUrl}/${req.files.thumbnail[0].path}`;

      // Create new content
      const newContent = new Content({
        title: req.body.title,
        category: req.body.category,
        description: req.body.description,
        fileUrl: fileUrl,
        thumbnailUrl: thumbnailUrl,
        createdBy: req.userId  // Menggunakan userId dari middleware auth
      });

      // Save to database
      const savedContent = await newContent.save();
      console.log('Saved content:', savedContent);

      res.status(201).json({
        success: true,
        message: 'Content uploaded successfully',
        data: savedContent
      });

    } catch (error) {
      console.error('Upload error:', error);
      
      // Hapus file yang sudah diupload jika terjadi error
      if (req.files) {
        Object.values(req.files).forEach(files => {
          files.forEach(file => {
            fs.unlink(file.path, (err) => {
              if (err) console.error('Error deleting file:', err);
            });
          });
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error uploading content',
        error: error.message
      });
    }
  }
);
// GET endpoint untuk konten publik dengan filter
// Ubah route /public menjadi:
router.get('/public', async (req, res) => { // Hapus auth middleware
  try {
    const { search, category, sortBy = 'newest' } = req.query;
    
    let query = {};
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) {
      query.category = category;
    }
    
    let sort = { createdAt: -1 }; // Default newest first
    
    const contents = await Content.find(query)
      .sort(sort)
      .populate('createdBy', 'name email')
      .lean();

    const formattedContents = contents.map(content => ({
      ...content,
      thumbnailUrl: content.thumbnailUrl.startsWith('http') 
        ? new URL(content.thumbnailUrl).pathname
        : content.thumbnailUrl,
      fileUrl: content.fileUrl.startsWith('http')
        ? new URL(content.fileUrl).pathname
        : content.fileUrl
    }));

    res.json({
      success: true,
      data: formattedContents
    });

  } catch (error) {
    console.error('Error fetching contents:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching contents',
      error: error.message
    });
  }
});
router.get('/public/:id', async (req, res) => {
  try {
    const content = await Content.findById(req.params.id)
      .populate('createdBy', 'name email')
      .lean();
    
    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    // Format URL
    const formattedContent = {
      ...content,
      thumbnailUrl: content.thumbnailUrl.startsWith('http') 
        ? new URL(content.thumbnailUrl).pathname
        : content.thumbnailUrl,
      fileUrl: content.fileUrl.startsWith('http')
        ? new URL(content.fileUrl).pathname
        : content.fileUrl
    };

    res.json({
      success: true,
      data: formattedContent
    });

  } catch (error) {
    console.error('Error fetching content:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching content',
      error: error.message
    });
  }
});

// GET endpoint untuk mengambil semua konten
router.get('/', auth, async (req, res) => {
  try {
    const { search, category, sortBy = 'newest' } = req.query;
    
    // Buat query filter
    let query = {};
    
    // Tambahkan filter pencarian jika ada
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Tambahkan filter kategori jika ada
    if (category) {
      query.category = category;
    }
    
    // Tentukan pengurutan
    let sort = {};
    switch (sortBy) {
      case 'oldest':
        sort = { createdAt: 1 };
        break;
      case 'title':
        sort = { title: 1 };
        break;
      case 'newest':
      default:
        sort = { createdAt: -1 };
        break;
    }

    const contents = await Content.find(query)
      .sort(sort)
      .populate('createdBy', 'name email')
      .lean();

    res.json({
      success: true,
      data: contents
    });

  } catch (error) {
    console.error('Error fetching contents:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching contents',
      error: error.message
    });
  }
});

// GET endpoint untuk mengambil konten by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const content = await Content.findById(req.params.id)
      .populate('createdBy', 'name email');
    
    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    res.json({
      success: true,
      data: content
    });

  } catch (error) {
    console.error('Error fetching content:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching content',
      error: error.message
    });
  }
});

// DELETE endpoint untuk menghapus konten
router.delete('/:id', auth, async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);
    
    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    // Verifikasi kepemilikan konten
    if (content.createdBy.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this content'
      });
    }

    // Hapus file fisik
    const fileUrlParts = content.fileUrl.split('/');
    const thumbnailUrlParts = content.thumbnailUrl.split('/');
    const filePath = path.join('uploads/educational-content', fileUrlParts[fileUrlParts.length - 1]);
    const thumbnailPath = path.join('uploads/thumbnails', thumbnailUrlParts[thumbnailUrlParts.length - 1]);

    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      if (fs.existsSync(thumbnailPath)) {
        fs.unlinkSync(thumbnailPath);
      }
    } catch (err) {
      console.error('Error deleting files:', err);
    }

    // Hapus dari database
    await Content.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Content deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting content:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting content',
      error: error.message
    });
  }
});

// PUT endpoint untuk mengupdate konten
router.put('/:id', 
  auth,
  upload.fields([
    { name: 'file', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const content = await Content.findById(req.params.id);
      
      if (!content) {
        return res.status(404).json({
          success: false,
          message: 'Content not found'
        });
      }

      // Verifikasi kepemilikan konten
      if (content.createdBy.toString() !== req.userId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to update this content'
        });
      }

      const updateData = {
        title: req.body.title,
        category: req.body.category,
        description: req.body.description
      };

      // Update file jika ada
      if (req.files.file) {
        // Hapus file lama
        const oldFilePath = content.fileUrl.split('/').pop();
        const oldFileFullPath = path.join('uploads/educational-content', oldFilePath);
        if (fs.existsSync(oldFileFullPath)) {
          fs.unlinkSync(oldFileFullPath);
        }

        // Set file baru
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        updateData.fileUrl = `${baseUrl}/${req.files.file[0].path}`;
      }

      // Update thumbnail jika ada
      if (req.files.thumbnail) {
        // Hapus thumbnail lama
        const oldThumbnailPath = content.thumbnailUrl.split('/').pop();
        const oldThumbnailFullPath = path.join('uploads/thumbnails', oldThumbnailPath);
        if (fs.existsSync(oldThumbnailFullPath)) {
          fs.unlinkSync(oldThumbnailFullPath);
        }

        // Set thumbnail baru
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        updateData.thumbnailUrl = `${baseUrl}/${req.files.thumbnail[0].path}`;
      }

      const updatedContent = await Content.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
      );

      res.json({
        success: true,
        message: 'Content updated successfully',
        data: updatedContent
      });

    } catch (error) {
      console.error('Error updating content:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating content',
        error: error.message
      });
    }
  }
);

module.exports = router;
