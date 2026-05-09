import mongoose from 'mongoose';

const diarySchema = new mongoose.Schema({
  date: {
    type: String, // stored as YYYY-MM-DD for easy lookup
    required: true,
    unique: true
  },
  leftContent: {
    type: String,
    default: ''
  },
  rightContent: {
    type: String,
    default: ''
  },
  content: {
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
}, {
  timestamps: true
});

diarySchema.index({ date: 1 });

const Diary = mongoose.model('Diary', diarySchema);

export default Diary;
