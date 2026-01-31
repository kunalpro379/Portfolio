import express from 'express';
import { BlobServiceClient } from '@azure/storage-blob';
import Diagram from '../models/Diagram.js';
import crypto from 'crypto';
import databaseUtils from '../utils/database.js';

const router = express.Router();

// Azure Blob Storage configuration
const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const CONTAINER_NAME = 'diagrams';

let blobServiceClient;
let containerClient;

// Initialize Azure Blob Storage
async function initializeBlobStorage() {
  try {
    if (!AZURE_STORAGE_CONNECTION_STRING) {
      console.warn('Azure Storage connection string not found');
      return false;
    }

    blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
    containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);

    // Create container if it doesn't exist
    await containerClient.createIfNotExists({
      access: 'blob'
    });

    console.log('✓ Azure Blob Storage initialized for diagrams');
    return true;
  } catch (error) {
    console.error('Error initializing Azure Blob Storage:', error);
    return false;
  }
}

// Initialize on module load (non-blocking)
initializeBlobStorage().catch(err => {
  console.error('Failed to initialize blob storage for diagrams:', err);
});

// Generate unique canvas ID
function generateCanvasId() {
  return `canvas_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
}

// Generate unique viewer ID
function generateViewerId() {
  return `viewer_${crypto.randomBytes(16).toString('hex')}`;
}

// GET all canvases
router.get('/', async (req, res) => {
  try {
    // Use database singleton to ensure connection and execute operation
    const canvases = await databaseUtils.executeOperation(async () => {
      // Check if Diagram model is available
      if (!Diagram) {
        return [];
      }

      return await Diagram.find()
        .select('canvasId name isPublic createdAt updatedAt thumbnail')
        .sort({ updatedAt: -1 });
    }, 'Fetch all canvases');

    res.json({
      success: true,
      canvases: canvases || []
    });
  } catch (error) {
    console.error('Error fetching canvases:', error);
    // Return empty array instead of error to prevent frontend issues
    res.json({
      success: true,
      canvases: []
    });
  }
});

// GET single canvas by ID
router.get('/:canvasId', async (req, res) => {
  try {
    const { canvasId } = req.params;

    const canvas = await databaseUtils.executeOperation(async () => {
      return await Diagram.findOne({ canvasId });
    }, `Fetch canvas ${canvasId}`);

    if (!canvas) {
      return res.status(404).json({
        success: false,
        message: 'Canvas not found'
      });
    }

    // Try to load from Azure Blob if available
    let canvasData = canvas.data;
    if (containerClient && canvas.blobUrl) {
      try {
        const blobName = `${canvasId}.excalidraw`;
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        const downloadResponse = await blockBlobClient.download();
        const downloaded = await streamToBuffer(downloadResponse.readableStreamBody);
        canvasData = JSON.parse(downloaded.toString());
        console.log('✓ Loaded canvas from Azure Blob Storage');
      } catch (blobError) {
        console.log('Using MongoDB data as fallback');
      }
    }

    res.json({
      success: true,
      data: canvasData,
      canvas: {
        canvasId: canvas.canvasId,
        viewerId: canvas.viewerId,
        name: canvas.name,
        isPublic: canvas.isPublic,
        createdAt: canvas.createdAt,
        updatedAt: canvas.updatedAt
      }
    });
  } catch (error) {
    console.error('Error fetching canvas:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch canvas',
      error: error.message
    });
  }
});

// GET canvas by viewerId (read-only access)
router.get('/viewer/:viewerId', async (req, res) => {
  try {
    const { viewerId } = req.params;

    const canvas = await databaseUtils.executeOperation(async () => {
      return await Diagram.findOne({ viewerId });
    }, `Fetch canvas by viewerId ${viewerId}`);

    if (!canvas) {
      return res.status(404).json({
        success: false,
        message: 'Canvas not found'
      });
    }

    // Try to load from Azure Blob if available
    let canvasData = canvas.data;
    if (containerClient && canvas.blobUrl) {
      try {
        const blobName = `${canvas.canvasId}.excalidraw`;
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        const downloadResponse = await blockBlobClient.download();
        const downloaded = await streamToBuffer(downloadResponse.readableStreamBody);
        canvasData = JSON.parse(downloaded.toString());
        console.log('✓ Loaded canvas from Azure Blob Storage');
      } catch (blobError) {
        console.log('Using MongoDB data as fallback');
      }
    }

    res.json({
      success: true,
      data: canvasData,
      canvas: {
        canvasId: canvas.canvasId,
        name: canvas.name,
        createdAt: canvas.createdAt,
        updatedAt: canvas.updatedAt
      },
      viewOnly: true // Always view-only for viewer links
    });
  } catch (error) {
    console.error('Error fetching canvas by viewerId:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch canvas',
      error: error.message
    });
  }
});

// Helper function to convert stream to buffer
async function streamToBuffer(readableStream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readableStream.on('data', (data) => {
      chunks.push(data instanceof Buffer ? data : Buffer.from(data));
    });
    readableStream.on('end', () => {
      resolve(Buffer.concat(chunks));
    });
    readableStream.on('error', reject);
  });
}

// POST create new canvas
router.post('/', async (req, res) => {
  try {
    const { name, isPublic, data } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Canvas name is required'
      });
    }

    const canvasId = generateCanvasId();
    const viewerId = generateViewerId();
    const canvasData = data || { elements: [], appState: {} };

    // Save to Azure Blob Storage
    let blobUrl = null;
    if (containerClient) {
      try {
        const blobName = `${canvasId}.excalidraw`;
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        
        const dataString = JSON.stringify(canvasData);
        const buffer = Buffer.from(dataString, 'utf-8');
        
        await blockBlobClient.upload(buffer, buffer.length, {
          blobHTTPHeaders: { 
            blobContentType: 'application/json',
            blobContentDisposition: `attachment; filename="${name}.excalidraw"`
          }
        });

        blobUrl = blockBlobClient.url;
        console.log('✓ Canvas uploaded to Azure Blob Storage:', blobUrl);
      } catch (blobError) {
        console.error('Error uploading to Azure Blob:', blobError);
      }
    }

    // Save to MongoDB using database singleton
    const newCanvas = await databaseUtils.executeOperation(async () => {
      const canvas = new Diagram({
        canvasId,
        viewerId,
        name,
        isPublic: isPublic || false,
        data: canvasData,
        blobUrl
      });

      return await canvas.save();
    }, `Create canvas ${canvasId}`);

    res.status(201).json({
      success: true,
      message: 'Canvas created successfully',
      canvasId: newCanvas.canvasId,
      viewerId: newCanvas.viewerId,
      blobUrl: blobUrl,
      canvas: {
        canvasId: newCanvas.canvasId,
        viewerId: newCanvas.viewerId,
        name: newCanvas.name,
        isPublic: newCanvas.isPublic,
        createdAt: newCanvas.createdAt,
        updatedAt: newCanvas.updatedAt
      }
    });
  } catch (error) {
    console.error('Error creating canvas:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create canvas',
      error: error.message
    });
  }
});

// PUT update canvas
router.put('/:canvasId', async (req, res) => {
  try {
    const { canvasId } = req.params;
    const { data, name, isPublic } = req.body;

    const canvas = await Diagram.findOne({ canvasId });

    if (!canvas) {
      return res.status(404).json({
        success: false,
        message: 'Canvas not found'
      });
    }

    // Update fields
    if (data) canvas.data = data;
    if (name) canvas.name = name;
    if (typeof isPublic !== 'undefined') canvas.isPublic = isPublic;

    // Update in Azure Blob Storage
    let blobUrl = canvas.blobUrl;
    if (containerClient && data) {
      try {
        const blobName = `${canvasId}.excalidraw`;
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        
        const dataString = JSON.stringify(data);
        const buffer = Buffer.from(dataString, 'utf-8');
        
        await blockBlobClient.upload(buffer, buffer.length, {
          blobHTTPHeaders: { 
            blobContentType: 'application/json',
            blobContentDisposition: `attachment; filename="${canvas.name}.excalidraw"`
          }
        });

        blobUrl = blockBlobClient.url;
        canvas.blobUrl = blobUrl;
        console.log('✓ Canvas updated in Azure Blob Storage:', blobUrl);
      } catch (blobError) {
        console.error('Error updating Azure Blob:', blobError);
      }
    }

    await canvas.save();

    res.json({
      success: true,
      message: 'Canvas updated successfully',
      blobUrl: blobUrl,
      canvas: {
        canvasId: canvas.canvasId,
        name: canvas.name,
        isPublic: canvas.isPublic,
        updatedAt: canvas.updatedAt
      }
    });
  } catch (error) {
    console.error('Error updating canvas:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update canvas',
      error: error.message
    });
  }
});

// DELETE canvas
router.delete('/:canvasId', async (req, res) => {
  try {
    const { canvasId } = req.params;

    const canvas = await Diagram.findOne({ canvasId });

    if (!canvas) {
      return res.status(404).json({
        success: false,
        message: 'Canvas not found'
      });
    }

    // Delete from Azure Blob Storage
    if (containerClient) {
      try {
        const blobName = `${canvasId}.excalidraw`;
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        await blockBlobClient.deleteIfExists();
        console.log('✓ Canvas deleted from Azure Blob Storage');
      } catch (blobError) {
        console.error('Error deleting from Azure Blob:', blobError);
      }
    }

    // Delete from MongoDB
    await Diagram.deleteOne({ canvasId });

    res.json({
      success: true,
      message: 'Canvas deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting canvas:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete canvas',
      error: error.message
    });
  }
});

// Ensure router is properly exported
if (!router) {
  console.error('ERROR: Router is undefined in diagrams.js');
}

export default router;
