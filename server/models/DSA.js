import mongoose from 'mongoose';

const dsaSchema = new mongoose.Schema({
  dsaId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  files: [{
    fileId: String,
    name: String,
    path: String, // Full path like "folder1/file.cpp"
    language: String, // cpp, java, python, javascript
    azurePath: String,
    azureUrl: String,
    canvasAzurePath: String,
    canvasAzureUrl: String,
    createdAt: { type: Date, default: Date.now }
  }],
  folders: [{
    folderId: String,
    name: String,
    path: String, // Full path like "folder1/subfolder"
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

dsaSchema.index({ createdAt: -1 });

export const DSA = mongoose.model('DSA', dsaSchema, 'dsa');
