import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
  blogId: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true
  },
  tagline: {
    type: String,
    default: ''
  },
  subject: {
    type: String,
    default: ''
  },
  shortDescription: {
    type: String,
    default: ''
  },
  tags: [String],
  datetime: {
    type: Date,
    default: Date.now
  },
  assets: [{
    name: String,
    url: String,
    filename: String
  }],
  mdFiles: [String], // Azure Blob URLs
  coverImage: {
    type: String,
    default: ''
  },
  footer: {
    type: String,
    default: ''
  },
  blogLinks: [{
    platform: String,
    url: String
  }],
  featured: {
    type: Boolean,
    default: false
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Only index datetime and subject (blogId and slug have unique: true which creates indexes automatically)
blogSchema.index({ datetime: -1 });
blogSchema.index({ subject: 1 });

export default mongoose.model('Blog', blogSchema, 'blogs');
