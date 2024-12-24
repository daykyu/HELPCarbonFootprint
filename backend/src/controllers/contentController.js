const Content = require('../models/Content');
const fs = require('fs').promises;
const path = require('path');

exports.uploadContent = async (req, res) => {
  try {
    const { title, category, description } = req.body;
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
      fileUrl: `/uploads/educational-content/${contentFile.filename}`,
      thumbnailUrl: `/uploads/thumbnails/${thumbnailFile.filename}`,
      fileName: contentFile.originalname,
      fileType: contentFile.mimetype,
      fileSize: contentFile.size,
      createdBy: req.userId
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

    const sortOptions = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      title: { title: 1 }
    };

    const skip = (page - 1) * limit;
    const total = await Content.countDocuments(query);
    const content = await Content.find(query)
      .sort(sortOptions[sortBy] || sortOptions.newest)
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

exports.updateContent = async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);
    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    // Handle file updates if new files are uploaded
    if (req.files?.file) {
      // Delete old content file
      const oldFilePath = path.join(__dirname, '..', content.fileUrl);
      await fs.unlink(oldFilePath).catch(console.error);
      
      content.fileUrl = `/uploads/educational-content/${req.files.file[0].filename}`;
      content.fileName = req.files.file[0].originalname;
      content.fileType = req.files.file[0].mimetype;
      content.fileSize = req.files.file[0].size;
    }

    if (req.files?.thumbnail) {
      // Delete old thumbnail
      const oldThumbnailPath = path.join(__dirname, '..', content.thumbnailUrl);
      await fs.unlink(oldThumbnailPath).catch(console.error);
      
      content.thumbnailUrl = `/uploads/thumbnails/${req.files.thumbnail[0].filename}`;
    }

    // Update other fields
    Object.keys(req.body).forEach(key => {
      if (key !== 'fileUrl' && key !== 'thumbnailUrl') {
        content[key] = req.body[key];
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