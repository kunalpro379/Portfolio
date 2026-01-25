import mongoose from 'mongoose';

const knowledgeBaseSchema = new mongoose.Schema({
  fileId: {
    type: String,
    required: true,
    unique: true
  },
  fileName: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    required: true,
    enum: ['.json', '.md', '.txt']
  },
  fileSize: {
    type: Number,
    required: true
  },
  azureBlobPath: {
    type: String,
    required: true
  },
  azureBlobUrl: {
    type: String,
    required: true
  },
  metadata: {
    type: Object,
    default: {}
  },
  status: {
    type: String,
    enum: ['processing', 'completed', 'failed'],
    default: 'processing'
  },
  vectorStatus: {
    type: String,
    enum: ['pending', 'uploaded', 'failed', 'skipped'],
    default: 'pending'
  },
  error: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for better query performance
knowledgeBaseSchema.index({ createdAt: -1 });
knowledgeBaseSchema.index({ status: 1 });
knowledgeBaseSchema.index({ fileType: 1 });

export const KnowledgeBase = mongoose.model('KnowledgeBase', knowledgeBaseSchema, 'knowledgebase');