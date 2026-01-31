import mongoose from 'mongoose';

const diagramSchema = new mongoose.Schema({
  canvasId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  viewerId: {
    type: String,
    unique: true,
    sparse: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: { elements: [], appState: {} }
  },
  blobUrl: {
    type: String
  },
  thumbnail: {
    type: String
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

// Update the updatedAt timestamp before saving
diagramSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Diagram = mongoose.model('Diagram', diagramSchema);

export default Diagram;
