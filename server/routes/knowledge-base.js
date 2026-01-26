import express from 'express';
import multer from 'multer';
import { BlobServiceClient } from '@azure/storage-blob';
import { KnowledgeBase } from '../models/KnowledgeBase.js';
import CONFIG from '../../config.shared.js';

const router = express.Router();

// CORS middleware for knowledge base routes
router.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigin = CONFIG.CORS.ORIGINS.includes(origin) ? origin : null;
  
  if (allowedOrigin) {
    res.header('Access-Control-Allow-Origin', allowedOrigin);
    res.header('Access-Control-Allow-Credentials', 'true');
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  
  next();
});

// Check if required environment variables exist
const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = 'knowledge-base';

if (!AZURE_STORAGE_CONNECTION_STRING) {
  console.warn('⚠️ AZURE_STORAGE_CONNECTION_STRING not found - Knowledge Base features will be limited');
}

let blobServiceClient;
try {
  if (AZURE_STORAGE_CONNECTION_STRING) {
    blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
  }
} catch (error) {
  console.error('❌ Error initializing Azure Blob Service:', error.message);
}

const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Only allow specific file types
    const allowedTypes = ['.json', '.md', '.txt'];
    const fileExtension = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
    
    if (allowedTypes.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error('Only JSON, Markdown (.md), and Text (.txt) files are allowed'), false);
    }
  }
});

function generateId() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 20; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

// Initialize Azure container
async function initializeContainer() {
  try {
    if (!blobServiceClient) {
      console.warn('⚠️ Azure Blob Service not initialized - skipping container creation');
      return false;
    }
    const containerClient = blobServiceClient.getContainerClient(containerName);
    await containerClient.createIfNotExists({
      access: 'blob'
    });
    console.log('✓ Knowledge base container initialized');
    return true;
  } catch (error) {
    console.error('Error initializing knowledge base container:', error);
    return false;
  }
}

// Initialize on startup
initializeContainer();

// Upload file to Azure Blob Storage
const uploadFileToAzure = async (fileBuffer, fileName, fileId) => {
  try {
    if (!blobServiceClient) {
      throw new Error('Azure Blob Service not initialized');
    }
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobPath = `files/${fileId}-${fileName}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobPath);
    
    await blockBlobClient.uploadData(fileBuffer, {
      blobHTTPHeaders: { 
        blobContentType: getContentType(fileName)
      },
      overwrite: true
    });
    
    return {
      blobPath,
      blobUrl: blockBlobClient.url
    };
  } catch (error) {
    console.error('Azure upload error:', error);
    throw error;
  }
};

// Get content type based on file extension
const getContentType = (fileName) => {
  const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
  switch (extension) {
    case '.json': return 'application/json';
    case '.md': return 'text/markdown';
    case '.txt': return 'text/plain';
    default: return 'text/plain';
  }
};

// Process file content for vector database
const processFileContent = (fileBuffer, fileName) => {
  const content = fileBuffer.toString('utf-8');
  const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
  
  let processedContent = content;
  let metadata = {
    fileName,
    fileType: extension,
    uploadedAt: new Date().toISOString()
  };
  
  // Handle different file types
  if (extension === '.json') {
    try {
      const jsonData = JSON.parse(content);
      processedContent = JSON.stringify(jsonData, null, 2);
      metadata.isValidJson = true;
    } catch (error) {
      metadata.isValidJson = false;
      metadata.jsonError = error.message;
    }
  }
  
  return { processedContent, metadata };
};

// Upload knowledge base file - simplified version
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded' 
      });
    }

    const { originalname, buffer, size } = req.file;
    const fileId = generateId();
    
    console.log(`Processing file: ${originalname} (${size} bytes)`);
    
    // Upload to Azure Blob Storage
    let blobPath, blobUrl;
    try {
      const uploadResult = await uploadFileToAzure(buffer, originalname, fileId);
      blobPath = uploadResult.blobPath;
      blobUrl = uploadResult.blobUrl;
      console.log('✅ File uploaded to Azure Blob Storage');
    } catch (azureError) {
      console.error('Azure upload failed:', azureError);
      // Continue without Azure storage
      blobPath = `local/${fileId}-${originalname}`;
      blobUrl = `local://files/${fileId}`;
      console.log('⚠️ Using local storage fallback');
    }
    
    // Process file content
    const { processedContent, metadata } = processFileContent(buffer, originalname);
    console.log('✅ File content processed');
    
    // Save to database
    const knowledgeBaseEntry = new KnowledgeBase({
      fileId,
      fileName: originalname,
      fileType: metadata.fileType,
      fileSize: size,
      azureBlobPath: blobPath,
      azureBlobUrl: blobUrl,
      metadata,
      status: 'completed',
      vectorStatus: 'skipped', // Skip vector processing for now
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await knowledgeBaseEntry.save();
    console.log('✅ File saved to database');
    
    res.json({ 
      success: true,
      message: 'File uploaded and processed successfully',
      fileId,
      fileName: originalname,
      fileSize: size
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Upload failed: ' + error.message,
      error: error.message
    });
  }
});

// Get all knowledge base files
router.get('/files', async (req, res) => {
  try {
    const files = await KnowledgeBase.find().sort({ createdAt: -1 });
    res.json({ success: true, files });
  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Health check route
router.get('/health', async (req, res) => {
  try {
    res.json({ 
      success: true, 
      message: 'Knowledge Base service is running',
      timestamp: new Date().toISOString(),
      features: {
        azureStorage: !!blobServiceClient,
        database: true,
        vectorDatabase: false // Will be checked dynamically
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Health check failed' });
  }
});

// Test route
router.get('/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Knowledge Base route is working',
    timestamp: new Date().toISOString()
  });
});

// Get knowledge base statistics
router.get('/stats', async (req, res) => {
  try {
    const totalFiles = await KnowledgeBase.countDocuments();
    const completedFiles = await KnowledgeBase.countDocuments({ status: 'completed' });
    const failedFiles = await KnowledgeBase.countDocuments({ status: 'failed' });
    
    res.json({ 
      success: true, 
      stats: {
        totalFiles,
        completedFiles,
        failedFiles,
        vectorPoints: 0 // Vector database disabled
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Process existing content from projects, blogs, docs, code
router.post('/process-existing', async (req, res) => {
  try {
    const { items } = req.body;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No items provided for processing' 
      });
    }

    const results = [];
    
    for (const item of items) {
      try {
        const fileId = generateId();
        let content = '';
        let fileName = '';
        
        // Extract content based on type
        switch (item.type) {
          case 'project':
          case 'blog':
            content = item.mdContent || '';
            fileName = `${item.title.replace(/[^a-zA-Z0-9]/g, '_')}.md`;
            break;
          case 'documentation':
          case 'code':
            content = item.content || '';
            fileName = item.fileName || `${item.title.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
            break;
          default:
            continue; // Skip unknown types
        }
        
        if (!content.trim()) {
          console.warn(`Skipping ${item.title} - no content found`);
          continue;
        }
        
        const contentBuffer = Buffer.from(content, 'utf-8');
        const fileSize = contentBuffer.length;
        
        // Upload to Azure Blob Storage
        let blobPath, blobUrl;
        try {
          const uploadResult = await uploadFileToAzure(contentBuffer, fileName, fileId);
          blobPath = uploadResult.blobPath;
          blobUrl = uploadResult.blobUrl;
        } catch (azureError) {
          console.error('Azure upload failed for', fileName, ':', azureError);
          // Continue without Azure storage
          blobPath = `local/${fileId}-${fileName}`;
          blobUrl = `local://files/${fileId}`;
        }
        
        // Process content
        const { processedContent, metadata } = processFileContent(contentBuffer, fileName);
        
        // Add additional metadata
        metadata.sourceType = item.type;
        metadata.sourceId = item._id;
        metadata.sourceTitle = item.title;
        metadata.processedAt = new Date().toISOString();
        
        // Save to knowledge base
        const knowledgeBaseEntry = new KnowledgeBase({
          fileId,
          fileName,
          fileType: fileName.endsWith('.md') ? '.md' : '.txt',
          fileSize,
          azureBlobPath: blobPath,
          azureBlobUrl: blobUrl,
          metadata,
          status: 'completed',
          vectorStatus: 'skipped', // Skip vector processing for now
          createdAt: new Date(),
          updatedAt: new Date()
        });

        await knowledgeBaseEntry.save();
        
        results.push({
          success: true,
          fileId,
          fileName,
          title: item.title,
          type: item.type
        });
        
        console.log(`✅ Processed ${item.type}: ${item.title}`);
        
      } catch (itemError) {
        console.error(`Error processing ${item.title}:`, itemError);
        results.push({
          success: false,
          title: item.title,
          type: item.type,
          error: itemError.message
        });
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;
    
    res.json({ 
      success: true, 
      message: `Processed ${successCount} items successfully${failureCount > 0 ? `, ${failureCount} failed` : ''}`,
      results,
      stats: {
        total: items.length,
        successful: successCount,
        failed: failureCount
      }
    });
    
  } catch (error) {
    console.error('Process existing content error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while processing existing content',
      error: error.message 
    });
  }
});

// Delete knowledge base file
router.delete('/files/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    
    const file = await KnowledgeBase.findOne({ fileId });
    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }
    
    // Delete from Azure Blob Storage
    try {
      if (blobServiceClient) {
        const containerClient = blobServiceClient.getContainerClient(containerName);
        const blockBlobClient = containerClient.getBlockBlobClient(file.azureBlobPath);
        await blockBlobClient.deleteIfExists();
      }
    } catch (azureError) {
      console.error('Error deleting from Azure:', azureError);
    }
    
    // Delete from database
    await KnowledgeBase.deleteOne({ fileId });
    
    res.json({ success: true, message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;