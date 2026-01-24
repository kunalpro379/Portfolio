import express from 'express';
import aiChatService from '../services/aiChatService.js';

const router = express.Router();

// Chat endpoint
router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
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

    console.log(`AI Chat Request: "${userMessage}"`);
    
    const result = await aiChatService.chat(userMessage);
    
    console.log(`AI Chat Response: ${result.success ? 'Success' : 'Failed'}`);
    
    res.json(result);
  } catch (error) {
    console.error('AI Chat API Error:', error);
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
        'Technical project explanations'
      ],
      limitations: [
        'Responses are based on available portfolio data',
        'Cannot provide real-time information beyond the knowledge base',
        'Cannot perform actions outside of answering questions'
      ]
    }
  });
});

export default router;