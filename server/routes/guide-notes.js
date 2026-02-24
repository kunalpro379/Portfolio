import express from 'express';
import multer from 'multer';
import { BlobServiceClient } from '@azure/storage-blob';
import GuideNote from '../models/GuideNote.js';
import CONFIG from '../../config.shared.js';

const router = express.Router();

// Initialize Azure Blob Storage client with error handling
let blobServiceClient;
let containerName;

try {
  if (process.env.AZURE_STORAGE_CONNECTION_STRING) {
    blobServiceClient = BlobServiceClient.fromConnectionString(
      process.env.AZURE_STORAGE_CONNECTION_STRING
    );
    containerName = process.env.AZURE_BLOB_CONTAINER_NAME;
    console.log('Azure Blob Storage initialized for guide-notes');
  } else {
    console.warn('Azure Storage connection string not found for guide-notes');
  }
} catch (error) {
  console.error('Failed to initialize Azure Blob Storage for guide-notes:', error);
}

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// Generate 20 character ID
function generateId() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 20; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

// Helper function to get allowed origin for CORS
const getAllowedOrigin = (origin) => {
  if (!origin) return null;
  if (CONFIG.CORS.ORIGINS.includes(origin)) {
    return origin;
  }
  return null;
};

// Middleware to set CORS headers
const setCorsHeaders = (req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigin = getAllowedOrigin(origin);
  
  if (allowedOrigin) {
    res.header('Access-Control-Allow-Origin', allowedOrigin);
    res.header('Access-Control-Allow-Credentials', 'true');
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
};

router.use(setCorsHeaders);

// Handle OPTIONS requests for CORS
router.options('*', (req, res) => {
  res.sendStatus(200);
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Guide notes API is running',
    azureConfigured: !!blobServiceClient
  });
});

// Upload asset to Azure Blob Storage
const uploadAssetToAzure = async (buffer, noteId, filename, fileType) => {
  try {
    if (!blobServiceClient || !containerName) {
      throw new Error('Azure Blob Storage not initialized');
    }
    
    const containerClient = blobServiceClient.getContainerClient(containerName);
    
    // Create blob path: guide-notes/noteId/assets/filename
    const blobPath = `guide-notes/${noteId}/assets/${filename}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobPath);
    
    // Upload with content type
    await blockBlobClient.upload(buffer, buffer.length, {
      blobHTTPHeaders: { blobContentType: fileType }
    });
    
    return {
      blobPath: blobPath,
      blobUrl: blockBlobClient.url
    };
  } catch (error) {
    console.error('Azure upload error:', error);
    throw error;
  }
};

// Create new guide note
router.post('/', async (req, res) => {
  try {
    const { title, topic, content, canvasData } = req.body;
    
    if (!title || !topic) {
      return res.status(400).json({ message: 'Title and topic are required' });
    }
    
    const noteId = generateId();
    
    const guideNote = new GuideNote({
      noteId,
      title,
      topic,
      content: content || '',
      canvasData: canvasData || null,
      assets: [],
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    await guideNote.save();
    
    res.status(201).json({
      message: 'Guide note created successfully',
      note: guideNote
    });
  } catch (error) {
    console.error('Create guide note error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all guide notes
router.get('/', async (req, res) => {
  try {
    console.log('Fetching all guide notes...');
    const notes = await GuideNote.find().sort({ updatedAt: -1 });
    console.log(`Found ${notes.length} guide notes`);
    res.json({ notes });
  } catch (error) {
    console.error('Get guide notes error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single guide note
router.get('/:noteId', async (req, res) => {
  try {
    const { noteId } = req.params;
    
    const note = await GuideNote.findOne({ noteId });
    if (!note) {
      return res.status(404).json({ message: 'Guide note not found' });
    }
    
    res.json({ note });
  } catch (error) {
    console.error('Get guide note error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update guide note
router.put('/:noteId', async (req, res) => {
  try {
    const { noteId } = req.params;
    const { title, topic, content, canvasData } = req.body;
    
    const note = await GuideNote.findOne({ noteId });
    if (!note) {
      return res.status(404).json({ message: 'Guide note not found' });
    }
    
    if (title) note.title = title;
    if (topic) note.topic = topic;
    if (content !== undefined) note.content = content;
    if (canvasData !== undefined) note.canvasData = canvasData;
    
    await note.save();
    
    res.json({
      message: 'Guide note updated successfully',
      note
    });
  } catch (error) {
    console.error('Update guide note error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Upload asset to guide note
router.post('/:noteId/assets', upload.single('file'), async (req, res) => {
  try {
    const { noteId } = req.params;
    
    const note = await GuideNote.findOne({ noteId });
    if (!note) {
      return res.status(404).json({ message: 'Guide note not found' });
    }
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const assetId = generateId();
    const result = await uploadAssetToAzure(
      req.file.buffer,
      noteId,
      req.file.originalname,
      req.file.mimetype
    );
    
    const asset = {
      assetId,
      filename: req.file.originalname,
      fileType: req.file.mimetype,
      size: req.file.size,
      azurePath: result.blobPath,
      azureUrl: result.blobUrl,
      uploadedAt: new Date()
    };
    
    note.assets.push(asset);
    await note.save();
    
    res.json({
      message: 'Asset uploaded successfully',
      asset
    });
  } catch (error) {
    console.error('Upload asset error:', error);
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
});

// Delete asset from guide note
router.delete('/:noteId/assets/:assetId', async (req, res) => {
  try {
    const { noteId, assetId } = req.params;
    
    const note = await GuideNote.findOne({ noteId });
    if (!note) {
      return res.status(404).json({ message: 'Guide note not found' });
    }
    
    const asset = note.assets.find(a => a.assetId === assetId);
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }
    
    // Delete from Azure
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(asset.azurePath);
    await blockBlobClient.deleteIfExists();
    
    // Remove from note
    note.assets = note.assets.filter(a => a.assetId !== assetId);
    await note.save();
    
    res.json({ message: 'Asset deleted successfully' });
  } catch (error) {
    console.error('Delete asset error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete guide note
router.delete('/:noteId', async (req, res) => {
  try {
    const { noteId } = req.params;
    
    const note = await GuideNote.findOne({ noteId });
    if (!note) {
      return res.status(404).json({ message: 'Guide note not found' });
    }
    
    // Delete all assets from Azure
    const containerClient = blobServiceClient.getContainerClient(containerName);
    for (const asset of note.assets) {
      try {
        const blockBlobClient = containerClient.getBlockBlobClient(asset.azurePath);
        await blockBlobClient.deleteIfExists();
      } catch (err) {
        console.error('Error deleting asset from Azure:', err);
      }
    }
    
    await GuideNote.deleteOne({ noteId });
    
    res.json({ message: 'Guide note deleted successfully' });
  } catch (error) {
    console.error('Delete guide note error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
