import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import Session from '../models/Session.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Generate session hash
function generateSessionHash() {
  return crypto.randomBytes(32).toString('hex');
}

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate session hash
    const sessionHash = generateSessionHash();

    // Save session to database (TTL: 7 hours)
    const session = new Session({
      sessionHash,
      userId: user._id,
      username: user.username,
      createdAt: new Date()
    });
    await session.save();

    // Generate JWT token with session hash
    const token = jwt.sign(
      { 
        userId: user._id, 
        username: user.username,
        sessionHash 
      },
      JWT_SECRET,
      { expiresIn: '7h' } // 7 hours
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify token endpoint
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Verify session exists and is not expired
    const session = await Session.findOne({ 
      sessionHash: decoded.sessionHash,
      userId: decoded.userId 
    });

    if (!session) {
      return res.status(401).json({ message: 'Session expired or invalid' });
    }

    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    res.status(401).json({ message: 'Invalid token' });
  }
});

// Logout endpoint
router.post('/logout', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(400).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Delete session from database
    await Session.deleteOne({ sessionHash: decoded.sessionHash });

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Refresh session endpoint (extends TTL by 7 more hours)
router.post('/refresh', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Find and update session (this resets the TTL)
    const session = await Session.findOne({ 
      sessionHash: decoded.sessionHash,
      userId: decoded.userId 
    });

    if (!session) {
      return res.status(401).json({ message: 'Session expired' });
    }

    // Update createdAt to reset TTL
    session.createdAt = new Date();
    await session.save();

    // Generate new token
    const newToken = jwt.sign(
      { 
        userId: decoded.userId, 
        username: decoded.username,
        sessionHash: decoded.sessionHash 
      },
      JWT_SECRET,
      { expiresIn: '7h' } // 7 hours
    );

    res.json({ 
      message: 'Session refreshed',
      token: newToken 
    });
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
});

export default router;
