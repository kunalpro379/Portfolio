import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  sessionHash: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  username: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 25200 // TTL: 7 hours (25200 seconds)
  }
});

export default mongoose.model('Session', sessionSchema, 'sessions');
