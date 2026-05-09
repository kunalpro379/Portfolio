import express from 'express';
import Diary from '../models/Diary.js';

const router = express.Router();

// Helper to normalize date string (expect YYYY-MM-DD)
function normalizeDate(dateStr) {
  if (!dateStr) return null;
  // Basic validation
  const match = /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
  return match ? dateStr : null;
}

// Get diary entry for a date
router.get('/:date', async (req, res) => {
  try {
    const date = normalizeDate(req.params.date);
    if (!date) return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD' });

    const entry = await Diary.findOne({ date });
    if (!entry) {
      return res.json({
        entry: {
          date,
          leftContent: '',
          rightContent: '',
          content: ''
        }
      });
    }

    res.json({
      entry: {
        date: entry.date,
        leftContent: entry.leftContent ?? entry.content ?? '',
        rightContent: entry.rightContent ?? entry.content ?? '',
        content: entry.content ?? ''
      }
    });
  } catch (error) {
    console.error('Get diary entry error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create or update diary entry for a date
router.put('/:date', async (req, res) => {
  try {
    const date = normalizeDate(req.params.date);
    const { leftContent, rightContent, content } = req.body;
    if (!date) return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD' });

    let entry = await Diary.findOne({ date });
    if (!entry) {
      entry = new Diary({
        date,
        leftContent: leftContent ?? content ?? '',
        rightContent: rightContent ?? content ?? '',
        content: content ?? rightContent ?? leftContent ?? ''
      });
    } else {
      if (leftContent !== undefined) entry.leftContent = leftContent;
      if (rightContent !== undefined) entry.rightContent = rightContent;
      if (content !== undefined) entry.content = content;
      if (content === undefined) {
        entry.content = rightContent ?? leftContent ?? entry.content ?? '';
      }
      entry.updatedAt = new Date();
    }

    await entry.save();
    res.json({ message: 'Diary saved', entry });
  } catch (error) {
    console.error('Save diary entry error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// List entries (optional start & end filter)
router.get('/', async (req, res) => {
  try {
    const { start, end } = req.query; // expect YYYY-MM-DD
    const filter = {};
    if (start && end) {
      filter.date = { $gte: start, $lte: end };
    }

    const entries = await Diary.find(filter).sort({ date: -1 }).select('date createdAt updatedAt');
    res.json({ entries });
  } catch (error) {
    console.error('List diary entries error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
