import express from 'express';
import multer from 'multer';
import { BlobServiceClient } from '@azure/storage-blob';
import { KnowledgeBase } from '../models/KnowledgeBase.js';

const router = express.Router();

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

// Upload knowledge base file
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
    
    // Set headers for Server-Sent Events
    res.writeHead(200, {
      'Content-Type': 'text/plain',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });
    
    // Step 1: Upload to Azure Blob Storage
    res.write(`data: ${JSON.stringify({ 
      step: 'upload', 
      message: 'Uploading file to Azure Blob Storage...', 
      progress: 20 
    })}\n\n`);

    let blobPath, blobUrl;
    try {
      const uploadResult = await uploadFileToAzure(buffer, originalname, fileId);
      blobPath = uploadResult.blobPath;
      blobUrl = uploadResult.blobUrl;
    } catch (azureError) {
      console.error('Azure upload failed:', azureError);
      // Continue without Azure storage
      blobPath = `local/${fileId}-${originalname}`;
      blobUrl = `local://files/${fileId}`;
    }
    
    // Step 2: Process file content
    res.write(`data: ${JSON.stringify({ 
      step: 'process', 
      message: 'Processing file content...', 
      progress: 40 
    })}\n\n`);

    const { processedContent, metadata } = processFileContent(buffer, originalname);
    
    // Step 3: Save to database
    res.write(`data: ${JSON.stringify({ 
      step: 'database', 
      message: 'Saving file information to database...', 
      progress: 60 
    })}\n\n`);

    const knowledgeBaseEntry = new KnowledgeBase({
      fileId,
      fileName: originalname,
      fileType: metadata.fileType,
      fileSize: size,
      azureBlobPath: blobPath,
      azureBlobUrl: blobUrl,
      metadata,
      status: 'processing',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await knowledgeBaseEntry.save();
    
    // Step 4: Upload to vector database
    res.write(`data: ${JSON.stringify({ 
      step: 'vector', 
      message: 'Uploading to vector database...', 
      progress: 80 
    })}\n\n`);

    try {
      // Try to import and use vector database functions
      const { uploadDocumentToQdrant } = await import('../../vectordb.js');
      
      // Upload to Qdrant vector database
      await uploadDocumentToQdrant(processedContent, {
        fileName: originalname,
        fileId,
        fileType: metadata.fileType,
        uploadedAt: metadata.uploadedAt
      });
      
      // Update status to completed
      knowledgeBaseEntry.status = 'completed';
      knowledgeBaseEntry.vectorStatus = 'uploaded';
      knowledgeBaseEntry.updatedAt = new Date();
      await knowledgeBaseEntry.save();
      
      // Step 5: Complete
      res.write(`data: ${JSON.stringify({ 
        step: 'complete', 
        message: 'Knowledge base updated successfully!', 
        progress: 100,
        success: true,
        fileId,
        fileName: originalname
      })}\n\n`);
      
    } catch (vectorError) {
      console.error('Vector database error:', vectorError);
      
      // Update status to failed
      knowledgeBaseEntry.status = 'failed';
      knowledgeBaseEntry.vectorStatus = 'failed';
      knowledgeBaseEntry.error = vectorError.message;
      knowledgeBaseEntry.updatedAt = new Date();
      await knowledgeBaseEntry.save();
      
      res.write(`data: ${JSON.stringify({ 
        step: 'error', 
        message: 'Failed to upload to vector database: ' + vectorError.message, 
        progress: 100,
        success: false,
        error: vectorError.message
      })}\n\n`);
    }
    
    res.end();
    
  } catch (error) {
    console.error('Upload error:', error);
    res.write(`data: ${JSON.stringify({ 
      step: 'error', 
      message: 'Upload failed: ' + error.message, 
      progress: 100,
      success: false,
      error: error.message
    })}\n\n`);
    res.end();
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

// Get vector database statistics
router.get('/stats', async (req, res) => {
  try {
    let vectorStats = null;
    try {
      const { getCollectionStats } = await import('../../vectordb.js');
      vectorStats = await getCollectionStats();
    } catch (vectorError) {
      console.warn('Vector database not available:', vectorError.message);
    }
    
    const totalFiles = await KnowledgeBase.countDocuments();
    const completedFiles = await KnowledgeBase.countDocuments({ status: 'completed' });
    const failedFiles = await KnowledgeBase.countDocuments({ status: 'failed' });
    
    res.json({ 
      success: true, 
      stats: {
        totalFiles,
        completedFiles,
        failedFiles,
        vectorStats
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
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