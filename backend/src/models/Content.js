const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['articles', 'videos', 'infographics']
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  fileUrl: {
    type: String,
    required: [true, 'File URL is required']
  },
  thumbnailUrl: {
    type: String,
    required: [true, 'Thumbnail URL is required']
  },
  fileName: String,
  fileType: String,
  fileSize: Number,
  featured: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'published'
  },
  views: {
    type: Number,
    default: 0
  },
  lastViewedAt: Date,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
contentSchema.index({ title: 'text', description: 'text' });
contentSchema.index({ category: 1, status: 1 });
contentSchema.index({ createdAt: -1 });
contentSchema.index({ featured: -1 });

module.exports = mongoose.model('Content', contentSchema);