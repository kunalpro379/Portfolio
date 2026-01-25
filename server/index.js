import dotenv from 'dotenv';
import CONFIG from '../config.shared.js';
import dbConnection from './config/database.js';
import serverConfig from './config/server.js';

// Load environment variables FIRST
dotenv.config();

// Initialize database connection using singleton
await dbConnection.connect();

// Get configured Express app using singleton
const app = serverConfig.getApp();

// Load routes
async function loadRoutes() {
  try {
    const { default: authRoutes } = await import('./routes/auth.js');
    const { default: notesRoutes } = await import('./routes/notes.js');
    const { default: codeRoutes } = await import('./routes/code.js');
    const { default: projectsRoutes } = await import('./routes/projects.js');
    const { default: todosRoutes } = await import('./routes/todos.js');
    const { default: blogsRoutes } = await import('./routes/blogs.js');
    const { default: documentationRoutes } = await import('./routes/documentation.js');
    const { default: healthRoutes } = await import('./routes/health.js');
    
    app.use('/api/auth', authRoutes);
    app.use('/api/notes', notesRoutes);
    app.use('/api/code', codeRoutes);
    app.use('/api/projects', projectsRoutes);
    app.use('/api/todos', todosRoutes);
    app.use('/api/blogs', blogsRoutes);
    app.use('/api/documentation', documentationRoutes);
    app.use('/api/health', healthRoutes);

    // Load AI Chat routes with error handling
    try {
      const aiChatModule = await import('./routes/ai-chat.js');
      if (aiChatModule && aiChatModule.default) {
        app.use('/api/ai-chat', aiChatModule.default);
        console.log('✓ AI Chat route loaded successfully');
      } else {
        throw new Error('AI Chat route export not found');
      }
    } catch (aiChatError) {
      console.error('✗ Failed to load AI Chat route:', aiChatError.message);
      // Add fallback route to prevent 404
      app.use('/api/ai-chat', (req, res) => {
        res.status(503).json({ 
          success: false, 
          message: 'AI Chat service not available', 
          error: 'Service temporarily unavailable' 
        });
      });
      console.log('✓ AI Chat fallback route registered');
    }

    // Load GitHub routes
    try {
      const githubModule = await import('./routes/github.js');
      if (githubModule && githubModule.default) {
        app.use('/api/github', githubModule.default);
        console.log('✓ GitHub route loaded successfully');
      } else {
        throw new Error('GitHub route export not found');
      }
    } catch (githubError) {
      console.error('✗ Failed to load GitHub route:', githubError.message);
      if (githubError.stack) {
        console.error('Stack trace:', githubError.stack);
      }
      // Add fallback route to prevent 404
      app.use('/api/github', (req, res) => {
        res.status(503).json({ message: 'GitHub integration not available', error: 'Service temporarily unavailable' });
      });
      console.log('✓ GitHub fallback route registered');
    }

    // Load Knowledge Base routes
    try {
      const knowledgeBaseModule = await import('./routes/knowledge-base.js');
      if (knowledgeBaseModule && knowledgeBaseModule.default) {
        app.use('/api/knowledge-base', knowledgeBaseModule.default);
        console.log('✓ Knowledge Base route loaded successfully');
      } else {
        throw new Error('Knowledge Base route export not found');
      }
    } catch (knowledgeBaseError) {
      console.error('✗ Failed to load Knowledge Base route:', knowledgeBaseError.message);
      if (knowledgeBaseError.stack) {
        console.error('Stack trace:', knowledgeBaseError.stack);
      }
      // Add fallback route to prevent 404
      app.use('/api/knowledge-base', (req, res) => {
        if (req.path === '/health') {
          res.json({ 
            success: true, 
            message: 'Knowledge Base service fallback',
            error: 'Service temporarily unavailable' 
          });
        } else if (req.path === '/files') {
          res.json({ 
            success: true, 
            files: [],
            message: 'Knowledge Base service not available' 
          });
        } else if (req.path === '/stats') {
          res.json({ 
            success: true, 
            stats: {
              totalFiles: 0,
              completedFiles: 0,
              failedFiles: 0,
              vectorStats: null
            },
            message: 'Knowledge Base service not available' 
          });
        } else {
          res.status(503).json({ 
            success: false,
            message: 'Knowledge Base service not available', 
            error: 'Service temporarily unavailable' 
          });
        }
      });
      console.log('✓ Knowledge Base fallback route registered');
    }

    // Load diagrams route with error handling
    try {
      const diagramsModule = await import('./routes/diagrams.js');
      if (diagramsModule && diagramsModule.default) {
        app.use('/api/diagrams', diagramsModule.default);
        console.log('✓ Diagrams route loaded successfully');
      } else {
        throw new Error('Diagrams route export not found');
      }
    } catch (diagramsError) {
      console.error('✗ Failed to load diagrams route:', diagramsError.message);
      if (diagramsError.stack) {
        console.error('Stack trace:', diagramsError.stack);
      }
      // Add fallback route to prevent 404
      app.use('/api/diagrams', (req, res) => {
        res.json({ success: true, canvases: [] });
      });
      console.log('✓ Diagrams fallback route registered');
    }

    try {
      const viewsModule = await import('./routes/views.js');
      app.use('/api/views', viewsModule.default);
      console.log('✓ Views route loaded');
    } catch {
      console.log('ℹ Views route not available yet');
    }

    console.log('✓ All routes loaded successfully');
  } catch (error) {
    console.error('Error loading routes:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

await loadRoutes();

app.get('/', (req, res) => {
  res.json({ message: 'Portfolio API Server' });
});

// Debug route to test if requests are reaching Express
app.post('/api/notes/files/upload/chunk/test', (req, res) => {
  console.log('Test route hit!', {
    method: req.method,
    headers: req.headers,
    body: req.body,
    hasFile: !!req.file
  });
  const origin = req.headers.origin;
  const allowedOrigin = CONFIG.CORS.ORIGINS.includes(origin) ? origin : null;
  if (allowedOrigin) {
    res.header('Access-Control-Allow-Origin', allowedOrigin);
    res.header('Access-Control-Allow-Credentials', 'true');
  }
  res.json({ message: 'Test route works', received: true });
});

// Start server using singleton pattern
await serverConfig.startServer(CONFIG.SERVER.PORT);

// Export app for Vercel serverless functions
export default app;
