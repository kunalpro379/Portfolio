import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const passwordSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    enum: ['TODO_PASSWORD'] // Can add more keys like 'GUIDE_PASSWORD' etc.
  },
  hashedPassword: {
    type: String,
    required: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Static method to verify password
passwordSchema.statics.verifyPassword = async function(key, plainPassword) {
  try {
    const passwordDoc = await this.findOne({ key });
    if (!passwordDoc) {
      return false;
    }
    return await bcrypt.compare(plainPassword, passwordDoc.hashedPassword);
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
};

// Static method to set/update password
passwordSchema.statics.setPassword = async function(key, plainPassword) {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);
    
    await this.findOneAndUpdate(
      { key },
      { hashedPassword, updatedAt: new Date() },
      { upsert: true, new: true }
    );
    
    return true;
  } catch (error) {
    console.error('Password set error:', error);
    return false;
  }
};

const Password = mongoose.model('Password', passwordSchema);

export default Password;
