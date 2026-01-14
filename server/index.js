import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import CONFIG from '../config.shared.js';

// Load environment variables FIRST
dotenv.config();

const app = express();
const PORT = CONFIG.SERVER.PORT;



// CORS Configuration - from shared config
const corsOptions = {
  origin: CONFIG.CORS.ORIGINS,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization', 'Content-Length'],
  maxAge: 86400
};

app.use(cors(corsOptions));

// Cache control
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// MongoDB Connection - using shared config
mongoose.connect(process.env.MONGODB_URI, {
  dbName: CONFIG.DATABASE.NAME
})
  .then(() => console.log(`MongoDB Connected to ${CONFIG.DATABASE.NAME} DB`))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Load routes
async function loadRoutes() {
  try {
    const { default: authRoutes } = await import('./routes/auth.js');
    const { default: notesRoutes } = await import('./routes/notes.js');
    const { default: projectsRoutes } = await import('./routes/projects.js');
    const { default: todosRoutes } = await import('./routes/todos.js');
    const { default: blogsRoutes } = await import('./routes/blogs.js');
    const { default: documentationRoutes } = await import('./routes/documentation.js');
    const { default: diagramsRoutes } = await import('./routes/diagrams.js');

    app.use('/api/auth', authRoutes);
    app.use('/api/notes', notesRoutes);
    app.use('/api/projects', projectsRoutes);
    app.use('/api/todos', todosRoutes);
    app.use('/api/blogs', blogsRoutes);
    app.use('/api/documentation', documentationRoutes);
    app.use('/api/diagrams', diagramsRoutes);

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
    process.exit(1);
  }
}

await loadRoutes();

app.get('/', (req, res) => {
  res.json({ message: 'Portfolio API Server' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
