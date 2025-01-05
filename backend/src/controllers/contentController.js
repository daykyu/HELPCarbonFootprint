const Content = require('../models/Content');
const fs = require('fs').promises;
const path = require('path');

// Get all content with filters
exports.getAllContent = async (req, res) => {
  try {
    const { search, category, sortBy = 'newest', page = 1, limit = 10 } = req.query;
    const query = {};
    
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // If not admin and accessing public route, show only published
    if (!req.userRole || req.userRole !== 'admin') {
      query.status = 'published';
    }

    const sortOptions = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      title: { title: 1 },
      popular: { views: -1 }
    };

    const skip = (page - 1) * limit;
    const total = await Content.countDocuments(query);
    
    const content = await Content.find(query)
      .sort(sortOptions[sortBy] || { featured: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy', 'username');

    res.json({
      success: true,
      data: content,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get single content by ID
exports.getContent = async (req, res) => {
  try {
    const content = await Content.findById(req.params.id)
      .populate('createdBy', 'username');

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    // Increment views for non-admin access
    if (!req.userRole || req.userRole !== 'admin') {
      content.views += 1;
      content.lastViewedAt = new Date();
      await content.save();
    }

    res.json({
      success: true,
      data: content
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Upload new content
exports.uploadContent = async (req, res) => {
  try {
    // Debug logging
    console.log('Upload request received');
    console.log('Headers:', req.headers);
    console.log('User ID:', req.userId);
    console.log('Body:', req.body);
    console.log('Files:', req.files);

    // Validasi file
    if (!req.files?.file?.[0] || !req.files?.thumbnail?.[0]) {
      return res.status(400).json({
        success: false,
        message: 'Both content file and thumbnail are required'
      });
    }

    // Validasi input
    const { title, category, description } = req.body;
    if (!title || !category || !description) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Validasi userId
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: 'User ID not found in request'
      });
    }

    const contentFile = req.files.file[0];
    const thumbnailFile = req.files.thumbnail[0];

    // Create content
    const content = new Content({
      title: title.trim(),
      category,
      description: description.trim(),
      fileUrl: `/uploads/educational-content/${contentFile.filename}`,
      thumbnailUrl: `/uploads/thumbnails/${thumbnailFile.filename}`,
      fileName: contentFile.originalname,
      fileType: contentFile.mimetype,
      fileSize: contentFile.size,
      createdBy: req.userId,
      status: 'published'
    });

    await content.save();

    res.status(201).json({
      success: true,
      data: content
    });

  } catch (error) {
    console.error('Upload error details:', error);

    // Cleanup files jika terjadi error
    if (req.files) {
      try {
        const filesToDelete = [
          req.files.file?.[0]?.path,
          req.files.thumbnail?.[0]?.path
        ].filter(Boolean);

        await Promise.all(
          filesToDelete.map(filePath =>
            fs.unlink(filePath).catch(err => 
              console.error(`Failed to delete ${filePath}:`, err)
            )
          )
        );
      } catch (cleanupError) {
        console.error('Cleanup error:', cleanupError);
      }
    }

    res.status(500).json({
      success: false,
      message: 'Error uploading content',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};



// Update existing content
exports.updateContent = async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);
    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    // Handle file updates
    if (req.files?.file) {
      const oldFilePath = path.join(__dirname, '..', content.fileUrl);
      await fs.unlink(oldFilePath).catch(console.error);
      
      content.fileUrl = `/uploads/educational-content/${req.files.file[0].filename}`;
      content.fileName = req.files.file[0].originalname;
      content.fileType = req.files.file[0].mimetype;
      content.fileSize = req.files.file[0].size;
    }

    if (req.files?.thumbnail) {
      const oldThumbnailPath = path.join(__dirname, '..', content.thumbnailUrl);
      await fs.unlink(oldThumbnailPath).catch(console.error);
      
      content.thumbnailUrl = `/uploads/thumbnails/${req.files.thumbnail[0].filename}`;
    }

    // Update other fields
    const allowedUpdates = ['title', 'description', 'featured', 'status', 'category'];
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        content[field] = req.body[field];
      }
    });

    await content.save();

    res.json({
      success: true,
      data: content
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete content
exports.deleteContent = async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);
    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    // Delete associated files
    const contentFilePath = path.join(__dirname, '..', content.fileUrl);
    const thumbnailFilePath = path.join(__dirname, '..', content.thumbnailUrl);
    
    await Promise.all([
      fs.unlink(contentFilePath).catch(console.error),
      fs.unlink(thumbnailFilePath).catch(console.error)
    ]);

    await content.deleteOne();

    res.json({
      success: true,
      message: 'Content deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Toggle favorite status
exports.toggleFavorite = async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);
    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    const index = content.favorites.indexOf(req.userId);
    if (index === -1) {
      content.favorites.push(req.userId);
    } else {
      content.favorites.splice(index, 1);
    }

    await content.save();

    res.json({
      success: true,
      isFavorited: index === -1
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get favorite content
exports.getFavoriteContent = async (req, res) => {
  try {
    const content = await Content.find({
      favorites: req.userId,
      status: 'published'
    }).populate('createdBy', 'username');

    res.json({
      success: true,
      data: content
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};