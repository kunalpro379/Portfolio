import mongoose from 'mongoose';

const viewSchema = new mongoose.Schema({
  viewId: {
    type: String,
    required: true,
    unique: true
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    default: ''
  },
  path: {
    type: String,
    required: true
  },
  referrer: {
    type: String,
    default: ''
  },
  country: {
    type: String,
    default: ''
  },
  city: {
    type: String,
    default: ''
  },
  device: {
    type: String,
    default: 'Unknown'
  },
  browser: {
    type: String,
    default: 'Unknown'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
viewSchema.index({ timestamp: -1 });
viewSchema.index({ ipAddress: 1 });
viewSchema.index({ path: 1 });

const View = mongoose.model('View', viewSchema);

export default View;
