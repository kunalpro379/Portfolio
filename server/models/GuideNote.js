import mongoose from 'mongoose';

// Document schema (markdown files, diagrams, attachments within a title)
const documentSchema = new mongoose.Schema({
  documentId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['markdown', 'diagram', 'attachment'],
    required: true
  },
  content: {
    type: String, // Markdown content or diagram data
    default: ''
  },
  fileType: String, // For attachments
  size: Number, // For attachments
  azurePath: String, // For attachments
  azureUrl: String, // For attachments
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Title schema (contains multiple documents)
const titleSchema = new mongoose.Schema({
  titleId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  documents: [documentSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Main Guide schema
const guideNoteSchema = new mongoose.Schema({
  guideId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  topic: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  titles: [titleSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
guideNoteSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const GuideNote = mongoose.model('GuideNote', guideNoteSchema);

export default GuideNote;
