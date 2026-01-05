import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  projectId: {
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
  tagline: String,
  footer: String,
  description: String,
  tags: [String],
  links: [{
    name: String,
    url: String
  }],
  mdFiles: [String], // Cloudinary URLs
  assets: [{
    name: String,      // Custom asset name (e.g., "hero-image")
    url: String,       // Cloudinary URL
    filename: String   // Original filename
  }],
  cardasset: [String], // Cloudinary URLs
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

// Only index created_at since projectId and slug already have unique indexes
projectSchema.index({ created_at: -1 });

export default mongoose.model('Project', projectSchema, 'projects');
