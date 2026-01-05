import mongoose from 'mongoose';

// Folder Schema
const folderSchema = new mongoose.Schema({
  folderId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  parentPath: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// File Schema
const fileSchema = new mongoose.Schema({
  fileId: {
    type: String,
    required: true,
    unique: true
  },
  filename: {
    type: String,
    required: true
  },
  folderPath: {
    type: String,
    required: true
  },
  cloudinaryPath: {
    type: String,
    required: true
  },
  cloudinaryUrl: {
    type: String,
    required: true
  },
  fileType: String,
  size: Number,
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

// Create indexes
folderSchema.index({ path: 1 });
folderSchema.index({ parentPath: 1 });
fileSchema.index({ folderPath: 1 });
fileSchema.index({ createdAt: -1 });

export const Folder = mongoose.model('Folder', folderSchema, 'folders');
export const File = mongoose.model('File', fileSchema, 'files');
