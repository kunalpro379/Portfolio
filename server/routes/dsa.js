import express from 'express';
import multer from 'multer';
import { BlobServiceClient } from '@azure/storage-blob';
import { DSA } from '../models/DSA.js';

const router = express.Router();

const blobServiceClient = BlobServiceClient.fromConnectionString(
  process.env.AZURE_STORAGE_CONNECTION_STRING
);
const containerName = process.env.AZURE_BLOB_CONTAINER_NAME;

const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
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

// Get all DSA projects
router.get('/', async (req, res) => {
  try {
    const projects = await DSA.find().sort({ createdAt: -1 });
    res.json({ projects });
  } catch (error) {
    console.error('Get DSA projects error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single DSA project
router.get('/:dsaId', async (req, res) => {
  try {
    const { dsaId } = req.params;
    const project = await DSA.findOne({ dsaId });
    
    if (!project) {
      return res.status(404).json({ message: 'DSA project not found' });
    }

    res.json({ project });
  } catch (error) {
    console.error('Get DSA project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create DSA project
router.post('/create', async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const dsaId = generateId();

    const project = new DSA({
      dsaId,
      name,
      description: description || '',
      files: [],
      folders: []
    });

    await project.save();

    res.status(201).json({
      message: 'DSA project created successfully',
      project
    });
  } catch (error) {
    console.error('Create DSA project error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create folder
router.post('/:dsaId/folders', async (req, res) => {
  try {
    const { dsaId } = req.params;
    const { name, path } = req.body;

    console.log('Creating folder:', { dsaId, name, path });

    const project = await DSA.findOne({ dsaId });
    if (!project) {
      console.log('Project not found:', dsaId);
      return res.status(404).json({ message: 'DSA project not found' });
    }

    const folderId = generateId();
    // Use the path as-is from frontend (it already includes the name)
    const fullPath = path;

    project.folders.push({
      folderId,
      name,
      path: fullPath,
      createdAt: new Date()
    });

    project.updatedAt = new Date();
    await project.save();

    console.log('Folder created successfully:', project.folders[project.folders.length - 1]);

    res.json({
      message: 'Folder created successfully',
      folder: project.folders[project.folders.length - 1]
    });
  } catch (error) {
    console.error('Create folder error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create file
router.post('/:dsaId/files', async (req, res) => {
  try {
    const { dsaId } = req.params;
    const { name, path, language, content } = req.body;

    console.log('Creating file:', { dsaId, name, path, language });

    const project = await DSA.findOne({ dsaId });
    if (!project) {
      console.log('Project not found:', dsaId);
      return res.status(404).json({ message: 'DSA project not found' });
    }

    const fileId = generateId();
    // Use the path as-is from frontend (it already includes the name)
    const fullPath = path;
    const azurePath = `dsa/${dsaId}/files/${fileId}-${name}`;

    // Upload to Azure
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(azurePath);
    
    const fileContent = content || '';
    await blockBlobClient.upload(fileContent, fileContent.length, {
      blobHTTPHeaders: { blobContentType: 'text/plain' }
    });

    console.log('File uploaded to Azure:', azurePath);

    project.files.push({
      fileId,
      name,
      path: fullPath,
      language: language || 'cpp',
      azurePath,
      azureUrl: blockBlobClient.url,
      canvasAzurePath: '',
      canvasAzureUrl: '',
      createdAt: new Date()
    });

    project.updatedAt = new Date();
    await project.save();

    console.log('File created successfully:', project.files[project.files.length - 1]);

    res.json({
      message: 'File created successfully',
      file: project.files[project.files.length - 1]
    });
  } catch (error) {
    console.error('Create file error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get file content
router.get('/:dsaId/files/:fileId', async (req, res) => {
  try {
    const { dsaId, fileId } = req.params;

    const project = await DSA.findOne({ dsaId });
    if (!project) {
      return res.status(404).json({ message: 'DSA project not found' });
    }

    const file = project.files.find(f => f.fileId === fileId);
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Fetch from Azure
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(file.azurePath);
    
    const downloadResponse = await blockBlobClient.download(0);
    const content = await streamToString(downloadResponse.readableStreamBody);

    res.json({ file, content });
  } catch (error) {
    console.error('Get file error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update file content
router.put('/:dsaId/files/:fileId', async (req, res) => {
  try {
    const { dsaId, fileId } = req.params;
    const { content, language } = req.body;

    const project = await DSA.findOne({ dsaId });
    if (!project) {
      return res.status(404).json({ message: 'DSA project not found' });
    }

    const file = project.files.find(f => f.fileId === fileId);
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Update language if provided
    if (language) {
      file.language = language;
    }

    // Upload to Azure
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(file.azurePath);
    
    await blockBlobClient.upload(content, content.length, {
      blobHTTPHeaders: { blobContentType: 'text/plain' },
      overwrite: true
    });

    project.updatedAt = new Date();
    await project.save();

    res.json({ message: 'File updated successfully', file });
  } catch (error) {
    console.error('Update file error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Save canvas
router.post('/:dsaId/files/:fileId/canvas', upload.single('canvas'), async (req, res) => {
  try {
    console.log('=== SAVE CANVAS REQUEST ===');
    const { dsaId, fileId } = req.params;
    console.log('DSA ID:', dsaId);
    console.log('File ID:', fileId);
    console.log('Has file:', !!req.file);
    console.log('File size:', req.file?.size);

    const project = await DSA.findOne({ dsaId });
    if (!project) {
      console.error('Project not found:', dsaId);
      return res.status(404).json({ message: 'DSA project not found' });
    }
    console.log('Project found:', project.name);

    const file = project.files.find(f => f.fileId === fileId);
    if (!file) {
      console.error('File not found:', fileId);
      return res.status(404).json({ message: 'File not found' });
    }
    console.log('File found:', file.name);

    if (!req.file) {
      console.error('No canvas file in request');
      return res.status(400).json({ message: 'No canvas file uploaded' });
    }

    const canvasPath = `dsa/${dsaId}/canvas/${fileId}-canvas.json`;
    console.log('Canvas path:', canvasPath);

    // Check Azure connection
    if (!blobServiceClient || !containerName) {
      console.error('Azure not configured');
      return res.status(500).json({ message: 'Azure storage not configured' });
    }

    // Upload to Azure as JSON
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(canvasPath);
    
    console.log('Uploading to Azure...');
    await blockBlobClient.uploadData(req.file.buffer, {
      blobHTTPHeaders: { blobContentType: 'application/json' }
    });
    console.log('✓ Uploaded to Azure');

    file.canvasAzurePath = canvasPath;
    file.canvasAzureUrl = blockBlobClient.url;

    project.updatedAt = new Date();
    await project.save();

    console.log('✓ Canvas saved to Azure:', canvasPath);
    console.log('✓ Canvas URL:', blockBlobClient.url);

    res.json({
      message: 'Canvas saved successfully',
      canvasUrl: blockBlobClient.url
    });
  } catch (error) {
    console.error('=== SAVE CANVAS ERROR ===');
    console.error('Error:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete file
router.delete('/:dsaId/files/:fileId', async (req, res) => {
  try {
    const { dsaId, fileId } = req.params;

    const project = await DSA.findOne({ dsaId });
    if (!project) {
      return res.status(404).json({ message: 'DSA project not found' });
    }

    const fileIndex = project.files.findIndex(f => f.fileId === fileId);
    if (fileIndex === -1) {
      return res.status(404).json({ message: 'File not found' });
    }

    const file = project.files[fileIndex];

    // Delete from Azure
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(file.azurePath);
    await blockBlobClient.deleteIfExists();

    if (file.canvasAzurePath) {
      const canvasBlobClient = containerClient.getBlockBlobClient(file.canvasAzurePath);
      await canvasBlobClient.deleteIfExists();
    }

    project.files.splice(fileIndex, 1);
    project.updatedAt = new Date();
    await project.save();

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete folder
router.delete('/:dsaId/folders/:folderId', async (req, res) => {
  try {
    const { dsaId, folderId } = req.params;

    const project = await DSA.findOne({ dsaId });
    if (!project) {
      return res.status(404).json({ message: 'DSA project not found' });
    }

    const folderIndex = project.folders.findIndex(f => f.folderId === folderId);
    if (folderIndex === -1) {
      return res.status(404).json({ message: 'Folder not found' });
    }

    const folder = project.folders[folderIndex];

    // Delete all files in this folder
    const filesToDelete = project.files.filter(f => f.path.startsWith(folder.path + '/') || f.path === folder.path);
    
    const containerClient = blobServiceClient.getContainerClient(containerName);
    for (const file of filesToDelete) {
      const blockBlobClient = containerClient.getBlockBlobClient(file.azurePath);
      await blockBlobClient.deleteIfExists();

      if (file.canvasAzurePath) {
        const canvasBlobClient = containerClient.getBlockBlobClient(file.canvasAzurePath);
        await canvasBlobClient.deleteIfExists();
      }
    }

    // Remove files and folder
    project.files = project.files.filter(f => !f.path.startsWith(folder.path + '/') && f.path !== folder.path);
    project.folders.splice(folderIndex, 1);
    
    project.updatedAt = new Date();
    await project.save();

    res.json({ message: 'Folder deleted successfully' });
  } catch (error) {
    console.error('Delete folder error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete DSA project
router.delete('/:dsaId', async (req, res) => {
  try {
    const { dsaId } = req.params;

    const project = await DSA.findOne({ dsaId });
    if (!project) {
      return res.status(404).json({ message: 'DSA project not found' });
    }

    // Delete all files from Azure
    const containerClient = blobServiceClient.getContainerClient(containerName);
    for (const file of project.files) {
      const blockBlobClient = containerClient.getBlockBlobClient(file.azurePath);
      await blockBlobClient.deleteIfExists();

      if (file.canvasAzurePath) {
        const canvasBlobClient = containerClient.getBlockBlobClient(file.canvasAzurePath);
        await canvasBlobClient.deleteIfExists();
      }
    }

    await DSA.deleteOne({ dsaId });

    res.json({ message: 'DSA project deleted successfully' });
  } catch (error) {
    console.error('Delete DSA project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function
async function streamToString(readableStream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readableStream.on('data', (data) => {
      chunks.push(data.toString());
    });
    readableStream.on('end', () => {
      resolve(chunks.join(''));
    });
    readableStream.on('error', reject);
  });
}

export default router;
