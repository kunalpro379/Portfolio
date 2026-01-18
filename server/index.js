import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import CONFIG from '../config.shared.js';

// Load environment variables FIRST
dotenv.config();

const app = express();
const PORT = CONFIG.SERVER.PORT;

// Log CORS origins for debugging
console.log('CORS Allowed Origins:', CONFIG.CORS.ORIGINS);

// CORS Configuration - from shared config
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list
    if (CONFIG.CORS.ORIGINS.includes(origin)) {
      console.log('CORS: Allowing origin:', origin);
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin, 'Allowed origins:', CONFIG.CORS.ORIGINS);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization', 'Content-Length', 'X-File-Name', 'X-File-Size', 'X-File-Type'],
  exposedHeaders: ['Content-Length', 'Content-Type'],
  maxAge: 86400,
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

// Handle preflight requests explicitly - MUST be before other routes
app.options('*', (req, res) => {
  const origin = req.headers.origin;
  const allowedOrigin = CONFIG.CORS.ORIGINS.includes(origin) ? origin : null;
  
  if (allowedOrigin) {
    res.header('Access-Control-Allow-Origin', allowedOrigin);
    res.header('Access-Control-Allow-Credentials', 'true');
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Content-Length, X-File-Name, X-File-Size, X-File-Type');
  res.header('Access-Control-Max-Age', '86400');
  res.status(204).end();
});

// Cache control
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// Log all incoming requests for debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`, {
    origin: req.headers.origin,
    contentType: req.headers['content-type'],
    contentLength: req.headers['content-length'],
    userAgent: req.headers['user-agent']?.substring(0, 50)
  });
  next();
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// MongoDB Connection - using shared config
// Handle connection for both serverless and traditional server environments
const connectMongoDB = async () => {
  try {
    // Check if already connected
    if (mongoose.connection.readyState === 1) {
      console.log('MongoDB already connected');
      return;
    }

    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: CONFIG.DATABASE.NAME
    });
    console.log(`MongoDB Connected to ${CONFIG.DATABASE.NAME} DB`);
  } catch (err) {
    console.error('MongoDB connection error:', err);
    // Don't exit in serverless environment - let Vercel handle it
    if (process.env.VERCEL !== '1') {
      process.exit(1);
    }
  }
};

connectMongoDB();

// Load routes
async function loadRoutes() {
  try {
    const { default: authRoutes } = await import('./routes/auth.js');
    const { default: notesRoutes } = await import('./routes/notes.js');
    const { default: projectsRoutes } = await import('./routes/projects.js');
    const { default: todosRoutes } = await import('./routes/todos.js');
    const { default: blogsRoutes } = await import('./routes/blogs.js');
    const { default: documentationRoutes } = await import('./routes/documentation.js');
    
    app.use('/api/auth', authRoutes);
    app.use('/api/notes', notesRoutes);
    app.use('/api/projects', projectsRoutes);
    app.use('/api/todos', todosRoutes);
    app.use('/api/blogs', blogsRoutes);
    app.use('/api/documentation', documentationRoutes);

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

// Error handling middleware - ensure CORS headers are set even on errors
app.use((err, req, res, next) => {
  console.error('Error:', err);
  const origin = req.headers.origin;
  const allowedOrigin = CONFIG.CORS.ORIGINS.includes(origin) ? origin : null;
  
  if (allowedOrigin) {
    res.header('Access-Control-Allow-Origin', allowedOrigin);
    res.header('Access-Control-Allow-Credentials', 'true');
  }
  
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Export app for Vercel serverless functions
// Only start listening if not in serverless environment
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
