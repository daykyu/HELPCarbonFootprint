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
    const { title, category, description, featured = false } = req.body;
    const contentFile = req.files.file[0];
    const thumbnailFile = req.files.thumbnail[0];

    if (!contentFile || !thumbnailFile) {
      return res.status(400).json({
        success: false,
        message: 'Please upload both content file and thumbnail'
      });
    }

    const content = await Content.create({
      title,
      category,
      description,
      featured: featured === 'true',
      fileUrl: `/uploads/educational-content/${contentFile.filename}`,
      thumbnailUrl: `/uploads/thumbnails/${thumbnailFile.filename}`,
      fileName: contentFile.originalname,
      fileType: contentFile.mimetype,
      fileSize: contentFile.size,
      createdBy: req.userId,
      status: 'published'
    });

    res.status(201).json({
      success: true,
      data: content
    });
  } catch (error) {
    // Clean up uploaded files if database operation fails
    if (req.files?.file) {
      await fs.unlink(req.files.file[0].path).catch(console.error);
    }
    if (req.files?.thumbnail) {
      await fs.unlink(req.files.thumbnail[0].path).catch(console.error);
    }
    
    res.status(500).json({
      success: false,
      message: error.message
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