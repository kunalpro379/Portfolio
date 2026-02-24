import mongoose from 'mongoose';

const guideNoteSchema = new mongoose.Schema({
  noteId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  topic: {
    type: String,
    required: true
  },
  content: {
    type: String, // Markdown content
    default: ''
  },
  canvasData: {
    type: String, // JSON string of Excalidraw canvas data
    default: null
  },
  assets: [{
    assetId: String,
    filename: String,
    fileType: String,
    size: Number,
    azurePath: String,
    azureUrl: String,
    uploadedAt: Date
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

// Update the updatedAt timestamp before saving
guideNoteSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const GuideNote = mongoose.model('GuideNote', guideNoteSchema);

export default GuideNote;
