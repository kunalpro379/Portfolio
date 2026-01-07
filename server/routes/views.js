import express from 'express';
import View from '../models/View.js';

const router = express.Router();

// Generate 20 character ID
function generateId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 20; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Helper to parse user agent
function parseUserAgent(userAgent) {
  const ua = userAgent.toLowerCase();
  
  let browser = 'Unknown';
  if (ua.includes('chrome')) browser = 'Chrome';
  else if (ua.includes('firefox')) browser = 'Firefox';
  else if (ua.includes('safari')) browser = 'Safari';
  else if (ua.includes('edge')) browser = 'Edge';
  else if (ua.includes('opera')) browser = 'Opera';
  
  let device = 'Desktop';
  if (ua.includes('mobile')) device = 'Mobile';
  else if (ua.includes('tablet')) device = 'Tablet';
  
  return { browser, device };
}

// Track a page view (PUBLIC - no auth required)
router.post('/track', async (req, res) => {
  try {
    const { path, referrer } = req.body;
    
    // Get IP address from various headers (for proxies/load balancers)
    const ipAddress = req.headers['x-forwarded-for']?.split(',')[0].trim() ||
                      req.headers['x-real-ip'] ||
                      req.connection.remoteAddress ||
                      req.socket.remoteAddress ||
                      'Unknown';
    
    const userAgent = req.headers['user-agent'] || '';
    const { browser, device } = parseUserAgent(userAgent);
    
    const view = new View({
      viewId: generateId(),
      ipAddress,
      userAgent,
      path: path || '/',
      referrer: referrer || '',
      browser,
      device
    });
    
    await view.save();
    
    res.json({ success: true, viewId: view.viewId });
  } catch (error) {
    console.error('Error tracking view:', error);
    res.status(500).json({ error: 'Failed to track view' });
  }
});

// Get all views (ADMIN - requires auth)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    
    const views = await View.find()
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await View.countDocuments();
    
    res.json({
      views,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching views:', error);
    res.status(500).json({ error: 'Failed to fetch views' });
  }
});

// Get view statistics (ADMIN)
router.get('/stats', async (req, res) => {
  try {
    const total = await View.countDocuments();
    
    // Get views from last 24 hours
    const last24h = await View.countDocuments({
      timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });
    
    // Get views from last 7 days
    const last7days = await View.countDocuments({
      timestamp: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });
    
    // Get unique visitors
    const uniqueIPs = await View.distinct('ipAddress');
    
    // Top pages
    const topPages = await View.aggregate([
      { $group: { _id: '$path', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    // Device breakdown
    const deviceStats = await View.aggregate([
      { $group: { _id: '$device', count: { $sum: 1 } } }
    ]);
    
    // Browser breakdown
    const browserStats = await View.aggregate([
      { $group: { _id: '$browser', count: { $sum: 1 } } }
    ]);
    
    res.json({
      total,
      last24h,
      last7days,
      uniqueVisitors: uniqueIPs.length,
      topPages,
      deviceStats,
      browserStats
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Delete a view (ADMIN)
router.delete('/:viewId', async (req, res) => {
  try {
    const { viewId } = req.params;
    await View.findOneAndDelete({ viewId });
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting view:', error);
    res.status(500).json({ error: 'Failed to delete view' });
  }
});

// Clear all views (ADMIN)
router.delete('/', async (req, res) => {
  try {
    await View.deleteMany({});
    res.json({ success: true, message: 'All views cleared' });
  } catch (error) {
    console.error('Error clearing views:', error);
    res.status(500).json({ error: 'Failed to clear views' });
  }
});

export default router;
