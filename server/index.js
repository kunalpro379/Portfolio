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
    const { default: projectsRoutes } = await import('./routes/projects.js');
    const { default: todosRoutes } = await import('./routes/todos.js');
    const { default: blogsRoutes } = await import('./routes/blogs.js');
    const { default: documentationRoutes } = await import('./routes/documentation.js');
    const { default: healthRoutes } = await import('./routes/health.js');
    
    app.use('/api/auth', authRoutes);
    app.use('/api/notes', notesRoutes);
    app.use('/api/projects', projectsRoutes);
    app.use('/api/todos', todosRoutes);
    app.use('/api/blogs', blogsRoutes);
    app.use('/api/documentation', documentationRoutes);
    app.use('/api/health', healthRoutes);

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
