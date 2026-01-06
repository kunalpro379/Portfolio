import mongoose from 'mongoose';

const documentationSchema = new mongoose.Schema({
  docId: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  tags: {
    type: [String],
    default: []
  },
  date: {
    type: String,
    default: ''
  },
  time: {
    type: String,
    default: ''
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  azureBlobPath: {
    type: String,
    required: true
  },
  azureBlobUrl: {
    type: String,
    required: true
  },
  assets: {
    type: Map,
    of: String,
    default: {}
  },
  files: [{
    fileId: String,
    name: String,
    type: String,
    azurePath: String,
    azureUrl: String,
    createdAt: Date
  }],
  diagramPath: {
    type: String,
    default: ''
  },
  diagramUrl: {
    type: String,
    default: ''
  },
  isPublic: {
    type: Boolean,
    default: false
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

// Only index createdAt and subject since slug already has unique index
documentationSchema.index({ createdAt: -1 });
documentationSchema.index({ subject: 1 });

export const Documentation = mongoose.model('Documentation', documentationSchema, 'documentation');
