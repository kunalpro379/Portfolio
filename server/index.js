import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables FIRST
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = [
  'https://api.kunalpatil.me',
  'https://www.api.kunalpatil.me',
  'https://admin.kunalpatil.me',
  'https://www.admin.kunalpatil.me',
  'https://kunalpatil.me',
  'https://www.kunalpatil.me',
  'https://portfolioadmin-sigma.vercel.app',
  'https://portfolioadmin-m72zig1wl-kunaldp379-gmailcoms-projects.vercel.app',
  'https://portfolioclient-git-master-kunaldp379-gmailcoms-projects.vercel.app',
  'https://www.portfolioclient-git-master-kunaldp379-gmailcoms-projects.vercel.app',
  'https://portfolioclient-1x2z5fjso-kunaldp379-gmailcoms-projects.vercel.app',
  'https://www.portfolioclient-1x2z5fjso-kunaldp379-gmailcoms-projects.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000'
];

// CORS configuration
app.use((req, res, next) => {
  const origin = req.headers.origin;

  // Check if origin is in allowed list or if no origin (server-to-server)
  if (allowedOrigins.includes(origin) || !origin) {
    res.setHeader('Access-Control-Allow-Origin', origin || allowedOrigins[0]);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Type');
  } else {
    // For debugging - log rejected origins
    console.log('CORS: Rejected origin:', origin);
  }

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});
app.use(express.json());

// MongoDB Connection - Single Portfolio DB for everything
mongoose.connect(process.env.MONGODB_URI, {
  dbName: 'Portfolio'
})
  .then(() => console.log('MongoDB Connected to Portfolio DB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Import routes after connection with error handling
async function loadRoutes() {
  try {
    const { default: authRoutes } = await import('./routes/auth.js');
    const { default: notesRoutes } = await import('./routes/notes.js');
    const { default: projectsRoutes } = await import('./routes/projects.js');
    const { default: todosRoutes } = await import('./routes/todos.js');
    const { default: blogsRoutes } = await import('./routes/blogs.js');
    const { default: documentationRoutes } = await import('./routes/documentation.js');

    // Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/notes', notesRoutes);
    app.use('/api/projects', projectsRoutes);
    app.use('/api/todos', todosRoutes);
    app.use('/api/blogs', blogsRoutes);
    app.use('/api/documentation', documentationRoutes);

    // Try to import views route (optional - may not exist yet)
    try {
      const viewsModule = await import('./routes/views.js');
      app.use('/api/views', viewsModule.default);
      console.log('✓ Views route loaded');
    } catch (error) {
      console.log('ℹ Views route not available yet');
    }

    console.log('✓ All routes loaded successfully');
  } catch (error) {
    console.error('Error loading routes:', error);
    process.exit(1);
  }
}

// Load routes
await loadRoutes();

app.get('/', (req, res) => {
  res.json({ message: 'Portfolio API Server' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
