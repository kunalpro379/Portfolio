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

// Generate slug from text
function generateSlug(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')      // Replace spaces with hyphens
    .replace(/-+/g, '-')       // Replace multiple hyphens with single hyphen
    .substring(0, 50);         // Limit length
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

// Upload file to Azure Blob Storage
const uploadToAzure = async (buffer, guideId, titleId, filename, fileType) => {
  try {
    if (!blobServiceClient || !containerName) {
      throw new Error('Azure Blob Storage not initialized');
    }
    
    const containerClient = blobServiceClient.getContainerClient(containerName);
    
    // Create blob path: guide-notes/guideId/titleId/filename
    const blobPath = `guide-notes/${guideId}/${titleId}/${filename}`;
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

// ============ GUIDE ROUTES ============

// Create new guide
router.post('/guides', async (req, res) => {
  try {
    console.log('Creating guide with data:', req.body);
    const { name, topic, description } = req.body;
    
    if (!name || !topic) {
      console.log('Validation failed: missing name or topic');
      return res.status(400).json({ message: 'Name and topic are required' });
    }
    
    const guideId = generateId();
    const guideSlug = generateSlug(name);
    
    console.log('Generated IDs:', { guideId, guideSlug });
    
    const guide = new GuideNote({
      guideId,
      guideSlug,
      name,
      topic,
      description: description || '',
      titles: [],
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log('Saving guide to database...');
    await guide.save();
    console.log('Guide saved successfully:', guideId);
    
    res.status(201).json({
      message: 'Guide created successfully',
      guide
    });
  } catch (error) {
    console.error('Create guide error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message,
      details: error.toString()
    });
  }
});

// Get all guides
router.get('/guides', async (req, res) => {
  try {
    const guides = await GuideNote.find().sort({ updatedAt: -1 });
    res.json({ guides });
  } catch (error) {
    console.error('Get guides error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single guide
router.get('/guides/:guideId', async (req, res) => {
  try {
    const { guideId } = req.params;
    
    const guide = await GuideNote.findOne({ guideId });
    if (!guide) {
      return res.status(404).json({ message: 'Guide not found' });
    }
    
    res.json({ guide });
  } catch (error) {
    console.error('Get guide error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get guide by slug and title by slug (for view mode)
router.get('/view/:guideSlug/:titleSlug', async (req, res) => {
  try {
    const { guideSlug, titleSlug } = req.params;
    
    const guide = await GuideNote.findOne({ guideSlug });
    if (!guide) {
      return res.status(404).json({ message: 'Guide not found' });
    }
    
    const title = guide.titles.find(t => t.titleSlug === titleSlug);
    if (!title) {
      return res.status(404).json({ message: 'Title not found' });
    }
    
    res.json({ guide, title });
  } catch (error) {
    console.error('Get guide by slug error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update guide
router.put('/guides/:guideId', async (req, res) => {
  try {
    const { guideId } = req.params;
    const { name, topic, description } = req.body;
    
    const guide = await GuideNote.findOne({ guideId });
    if (!guide) {
      return res.status(404).json({ message: 'Guide not found' });
    }
    
    if (name) guide.name = name;
    if (topic) guide.topic = topic;
    if (description !== undefined) guide.description = description;
    
    await guide.save();
    
    res.json({
      message: 'Guide updated successfully',
      guide
    });
  } catch (error) {
    console.error('Update guide error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete guide
// Delete guide with password protection
router.delete('/guides/:guideId', async (req, res) => {
  try {
    const { guideId } = req.params;
    const { password } = req.body;
    
    // Check password
    const CORRECT_PASSWORD = 'Lawm@822471'; // Same as todo password
    if (password !== CORRECT_PASSWORD) {
      return res.status(401).json({ message: 'Incorrect password' });
    }
    
    const guide = await GuideNote.findOne({ guideId });
    if (!guide) {
      return res.status(404).json({ message: 'Guide not found' });
    }
    
    // Delete all files from Azure
    if (blobServiceClient && containerName) {
      const containerClient = blobServiceClient.getContainerClient(containerName);
      for (const title of guide.titles) {
        for (const doc of title.documents) {
          if (doc.type === 'attachment' && doc.azurePath) {
            try {
              const blockBlobClient = containerClient.getBlockBlobClient(doc.azurePath);
              await blockBlobClient.deleteIfExists();
            } catch (err) {
              console.error('Error deleting file from Azure:', err);
            }
          }
        }
      }
    }
    
    await GuideNote.deleteOne({ guideId });
    
    res.json({ message: 'Guide deleted successfully' });
  } catch (error) {
    console.error('Delete guide error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============ TITLE ROUTES ============

// Create new title in guide
router.post('/guides/:guideId/titles', async (req, res) => {
  try {
    const { guideId } = req.params;
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Title name is required' });
    }
    
    const guide = await GuideNote.findOne({ guideId });
    if (!guide) {
      return res.status(404).json({ message: 'Guide not found' });
    }
    
    const titleId = generateId();
    const titleSlug = generateSlug(name);
    const newTitle = {
      titleId,
      titleSlug,
      name,
      description: description || '',
      documents: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    guide.titles.push(newTitle);
    await guide.save();
    
    res.status(201).json({
      message: 'Title created successfully',
      title: newTitle
    });
  } catch (error) {
    console.error('Create title error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update title
router.put('/guides/:guideId/titles/:titleId', async (req, res) => {
  try {
    const { guideId, titleId } = req.params;
    const { name, description } = req.body;
    
    const guide = await GuideNote.findOne({ guideId });
    if (!guide) {
      return res.status(404).json({ message: 'Guide not found' });
    }
    
    const title = guide.titles.find(t => t.titleId === titleId);
    if (!title) {
      return res.status(404).json({ message: 'Title not found' });
    }
    
    if (name) title.name = name;
    if (description !== undefined) title.description = description;
    title.updatedAt = new Date();
    
    await guide.save();
    
    res.json({
      message: 'Title updated successfully',
      title
    });
  } catch (error) {
    console.error('Update title error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete title with password protection
router.delete('/guides/:guideId/titles/:titleId', async (req, res) => {
  try {
    const { guideId, titleId } = req.params;
    const { password } = req.body;
    
    // Check password
    const CORRECT_PASSWORD = 'Lawm@822471';
    if (password !== CORRECT_PASSWORD) {
      return res.status(401).json({ message: 'Incorrect password' });
    }
    
    const guide = await GuideNote.findOne({ guideId });
    if (!guide) {
      return res.status(404).json({ message: 'Guide not found' });
    }
    
    const title = guide.titles.find(t => t.titleId === titleId);
    if (!title) {
      return res.status(404).json({ message: 'Title not found' });
    }
    
    // Delete all attachments from Azure
    if (blobServiceClient && containerName) {
      const containerClient = blobServiceClient.getContainerClient(containerName);
      for (const doc of title.documents) {
        if (doc.type === 'attachment' && doc.azurePath) {
          try {
            const blockBlobClient = containerClient.getBlockBlobClient(doc.azurePath);
            await blockBlobClient.deleteIfExists();
          } catch (err) {
            console.error('Error deleting file from Azure:', err);
          }
        }
      }
    }
    
    guide.titles = guide.titles.filter(t => t.titleId !== titleId);
    await guide.save();
    
    res.json({ message: 'Title deleted successfully' });
  } catch (error) {
    console.error('Delete title error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============ DOCUMENT ROUTES ============

// Create markdown document
router.post('/guides/:guideId/titles/:titleId/documents/markdown', async (req, res) => {
  try {
    const { guideId, titleId } = req.params;
    const { name, content } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Document name is required' });
    }
    
    const guide = await GuideNote.findOne({ guideId });
    if (!guide) {
      return res.status(404).json({ message: 'Guide not found' });
    }
    
    const title = guide.titles.find(t => t.titleId === titleId);
    if (!title) {
      return res.status(404).json({ message: 'Title not found' });
    }
    
    const documentId = generateId();
    const newDoc = {
      documentId,
      name,
      type: 'markdown',
      content: content || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    title.documents.push(newDoc);
    title.updatedAt = new Date();
    await guide.save();
    
    res.status(201).json({
      message: 'Markdown document created successfully',
      document: newDoc
    });
  } catch (error) {
    console.error('Create markdown document error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create diagram document
router.post('/guides/:guideId/titles/:titleId/documents/diagram', async (req, res) => {
  try {
    const { guideId, titleId } = req.params;
    const { name, content } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Document name is required' });
    }
    
    const guide = await GuideNote.findOne({ guideId });
    if (!guide) {
      return res.status(404).json({ message: 'Guide not found' });
    }
    
    const title = guide.titles.find(t => t.titleId === titleId);
    if (!title) {
      return res.status(404).json({ message: 'Title not found' });
    }
    
    const documentId = generateId();
    const newDoc = {
      documentId,
      name,
      type: 'diagram',
      content: content || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    title.documents.push(newDoc);
    title.updatedAt = new Date();
    await guide.save();
    
    res.status(201).json({
      message: 'Diagram document created successfully',
      document: newDoc
    });
  } catch (error) {
    console.error('Create diagram document error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Upload attachment document
router.post('/guides/:guideId/titles/:titleId/documents/attachment', upload.single('file'), async (req, res) => {
  try {
    const { guideId, titleId } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const guide = await GuideNote.findOne({ guideId });
    if (!guide) {
      return res.status(404).json({ message: 'Guide not found' });
    }
    
    const title = guide.titles.find(t => t.titleId === titleId);
    if (!title) {
      return res.status(404).json({ message: 'Title not found' });
    }
    
    const documentId = generateId();
    const result = await uploadToAzure(
      req.file.buffer,
      guideId,
      titleId,
      req.file.originalname,
      req.file.mimetype
    );
    
    const newDoc = {
      documentId,
      name: req.file.originalname,
      type: 'attachment',
      content: '',
      fileType: req.file.mimetype,
      size: req.file.size,
      azurePath: result.blobPath,
      azureUrl: result.blobUrl,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    title.documents.push(newDoc);
    title.updatedAt = new Date();
    await guide.save();
    
    res.status(201).json({
      message: 'Attachment uploaded successfully',
      document: newDoc
    });
  } catch (error) {
    console.error('Upload attachment error:', error);
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
});

// Update document
router.put('/guides/:guideId/titles/:titleId/documents/:documentId', async (req, res) => {
  try {
    const { guideId, titleId, documentId } = req.params;
    const { name, content } = req.body;
    
    const guide = await GuideNote.findOne({ guideId });
    if (!guide) {
      return res.status(404).json({ message: 'Guide not found' });
    }
    
    const title = guide.titles.find(t => t.titleId === titleId);
    if (!title) {
      return res.status(404).json({ message: 'Title not found' });
    }
    
    const document = title.documents.find(d => d.documentId === documentId);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    if (name) document.name = name;
    if (content !== undefined) document.content = content;
    document.updatedAt = new Date();
    title.updatedAt = new Date();
    
    await guide.save();
    
    res.json({
      message: 'Document updated successfully',
      document
    });
  } catch (error) {
    console.error('Update document error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete document
router.delete('/guides/:guideId/titles/:titleId/documents/:documentId', async (req, res) => {
  try {
    const { guideId, titleId, documentId } = req.params;
    
    const guide = await GuideNote.findOne({ guideId });
    if (!guide) {
      return res.status(404).json({ message: 'Guide not found' });
    }
    
    const title = guide.titles.find(t => t.titleId === titleId);
    if (!title) {
      return res.status(404).json({ message: 'Title not found' });
    }
    
    const document = title.documents.find(d => d.documentId === documentId);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    // Delete from Azure if it's an attachment
    if (document.type === 'attachment' && document.azurePath && blobServiceClient && containerName) {
      try {
        const containerClient = blobServiceClient.getContainerClient(containerName);
        const blockBlobClient = containerClient.getBlockBlobClient(document.azurePath);
        await blockBlobClient.deleteIfExists();
      } catch (err) {
        console.error('Error deleting file from Azure:', err);
      }
    }
    
    title.documents = title.documents.filter(d => d.documentId !== documentId);
    title.updatedAt = new Date();
    await guide.save();
    
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get shareable link for guide
router.get('/guides/:guideId/share', async (req, res) => {
  try {
    const { guideId } = req.params;
    
    const guide = await GuideNote.findOne({ guideId });
    if (!guide) {
      return res.status(404).json({ message: 'Guide not found' });
    }
    
    const shareUrl = `${req.protocol}://${req.get('host')}/learnings/guide/${guideId}`;
    
    res.json({
      shareUrl,
      guide: {
        guideId: guide.guideId,
        name: guide.name,
        topic: guide.topic
      }
    });
  } catch (error) {
    console.error('Get share link error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get shareable link for title
router.get('/guides/:guideId/titles/:titleId/share', async (req, res) => {
  try {
    const { guideId, titleId } = req.params;
    
    const guide = await GuideNote.findOne({ guideId });
    if (!guide) {
      return res.status(404).json({ message: 'Guide not found' });
    }
    
    const title = guide.titles.find(t => t.titleId === titleId);
    if (!title) {
      return res.status(404).json({ message: 'Title not found' });
    }
    
    // Use slug-based URL for sharing (view mode)
    const guideSlug = guide.guideSlug || guide.guideId;
    const titleSlug = title.titleSlug || title.titleId;
    const shareUrl = `${req.protocol}://${req.get('host')}/learn/${guideSlug}/${titleSlug}`;
    
    res.json({
      shareUrl,
      guide: {
        guideId: guide.guideId,
        name: guide.name
      },
      title: {
        titleId: title.titleId,
        name: title.name
      }
    });
  } catch (error) {
    console.error('Get title share link error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
