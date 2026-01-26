import express from 'express';
import aiChatService from '../services/aiChatService.js';

const router = express.Router();

// Chat endpoint with session management
router.post('/chat', async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Message is required and must be a non-empty string'
      });
    }

    // Rate limiting check (simple implementation)
    const userMessage = message.trim();
    if (userMessage.length > 1000) {
      return res.status(400).json({
        success: false,
        error: 'Message too long. Please keep it under 1000 characters.'
      });
    }

    console.log(`💬 AI Chat Request: "${userMessage}" ${sessionId ? `(Session: ${sessionId.substring(0, 8)}...)` : '(New Session)'}`);
    
    const result = await aiChatService.chat(userMessage, sessionId);
    
    console.log(`✅ AI Chat Response: ${result.success ? 'Success' : 'Failed'} (Session: ${result.sessionId?.substring(0, 8)}...)`);
    
    res.json(result);
  } catch (error) {
    console.error('❌ AI Chat API Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
});

// Health check endpoint
router.get('/health', async (req, res) => {
  try {
    const health = await aiChatService.healthCheck();
    res.json({
      success: true,
      status: 'AI Chat Service Health Check',
      services: health,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('AI Chat Health Check Error:', error);
    res.status(500).json({
      success: false,
      error: 'Health check failed',
      timestamp: new Date().toISOString()
    });
  }
});

// Get chat capabilities
router.get('/capabilities', (req, res) => {
  res.json({
    success: true,
    capabilities: {
      topics: [
        'Professional background and experience',
        'Technical skills and technologies',
        'Project details and achievements',
        'Education and certifications',
        'Blog posts and knowledge sharing',
        'Hackathon participation',
        'Contact information'
      ],
      features: [
        'Context-aware responses using RAG',
        'Real-time knowledge base search',
        'Professional portfolio assistance',
        'Technical project explanations',
        'Session-based conversation memory',
        'Automatic session cleanup'
      ],
      limitations: [
        'Responses are based on available portfolio data',
        'Cannot provide real-time information beyond the knowledge base',
        'Cannot perform actions outside of answering questions',
        'Sessions expire after 30 minutes of inactivity'
      ]
    }
  });
});

// Session management endpoints

// Create new session
router.post('/session/new', (req, res) => {
  try {
    const sessionId = aiChatService.generateSessionId();
    aiChatService.initializeSession(sessionId);
    
    res.json({
      success: true,
      sessionId,
      message: 'New session created',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error creating session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create session'
    });
  }
});

// Get session statistics
router.get('/session/:sessionId/stats', (req, res) => {
  try {
    const { sessionId } = req.params;
    const stats = aiChatService.getSessionStats(sessionId);
    
    if (!stats) {
      return res.status(404).json({
        success: false,
        error: 'Session not found or expired'
      });
    }
    
    res.json({
      success: true,
      stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error getting session stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get session statistics'
    });
  }
});

// Get session conversation history
router.get('/session/:sessionId/history', (req, res) => {
  try {
    const { sessionId } = req.params;
    const history = aiChatService.getSessionHistory(sessionId);
    
    if (!history) {
      return res.status(404).json({
        success: false,
        error: 'Session not found or expired'
      });
    }
    
    res.json({
      success: true,
      sessionId,
      history,
      messageCount: history.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error getting session history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get session history'
    });
  }
});

// Get all active sessions (admin endpoint)
router.get('/sessions/all', (req, res) => {
  try {
    const allStats = aiChatService.getAllSessionsStats();
    
    res.json({
      success: true,
      sessions: allStats,
      totalActiveSessions: allStats.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error getting all sessions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get sessions data'
    });
  }
});

// Manual cleanup endpoint (admin)
router.post('/sessions/cleanup', (req, res) => {
  try {
    const beforeCount = aiChatService.conversationMemory.size;
    aiChatService.cleanupExpiredSessions();
    const afterCount = aiChatService.conversationMemory.size;
    
    res.json({
      success: true,
      message: 'Session cleanup completed',
      sessionsRemoved: beforeCount - afterCount,
      activeSessions: afterCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error during manual cleanup:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cleanup sessions'
    });
  }
});

export default router;