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
  'https://portfolioadmin-sigma.vercel.app/',
  'https://portfolioadmin-m72zig1wl-kunaldp379-gmailcoms-projects.vercel.app/',
  'https://www.api.kunalpatil.me',
  'https://admin.kunalpatil.me',
  'https://www.admin.kunalpatil.me',
  'https://kunalpatil.me',
  'https://www.kunalpatil.me',
  'https://portfolioclient-git-master-kunaldp379-gmailcoms-projects.vercel.app',
  'https://www.portfolioclient-git-master-kunaldp379-gmailcoms-projects.vercel.app',
  'https://portfolioclient-1x2z5fjso-kunaldp379-gmailcoms-projects.vercel.app',
  'https://www.portfolioclient-1x2z5fjso-kunaldp379-gmailcoms-projects.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  'https://api.kunalpatil.me/api/documentation',
  'https://api.kunalpatil.me/api/blogs'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
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
