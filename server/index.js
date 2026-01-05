import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables FIRST
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection - Single Portfolio DB for everything
mongoose.connect(process.env.MONGODB_URI, {
  dbName: 'Portfolio'
})
.then(() => console.log('MongoDB Connected to Portfolio DB'))
.catch(err => console.error('MongoDB connection error:', err));

// Import routes after connection
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

app.get('/', (req, res) => {
  res.json({ message: 'Portfolio API Server' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
