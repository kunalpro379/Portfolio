import express from 'express';
import multer from 'multer';
import { BlobServiceClient } from '@azure/storage-blob';
import { Folder, File } from '../models/Note.js';

const router = express.Router();

// Initialize Azure Blob Storage client
const blobServiceClient = BlobServiceClient.fromConnectionString(
  process.env.AZURE_STORAGE_CONNECTION_STRING
);
const containerName = process.env.AZURE_BLOB_CONTAINER_NAME;

// Configure multer for memory storage with 200MB limit
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 200 * 1024 * 1024 // 200MB in bytes
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

// Upload file to Azure Blob Storage
const uploadToAzure = async (buffer, folderPath, filename, fileType) => {
  try {
    const containerClient = blobServiceClient.getContainerClient(containerName);
    
    // Create blob path: notes/folderPath/filename
    const blobPath = `notes/${folderPath}/${filename}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobPath);
    
    // Upload with content type
    await blockBlobClient.upload(buffer, buffer.length, {
      blobHTTPHeaders: { blobContentType: fileType }
    });
    
    // Return blob URL and path
    return {
      blobPath: blobPath,
      blobUrl: blockBlobClient.url
    };
  } catch (error) {
    console.error('Azure upload error:', error);
    throw error;
  }
};

// Create new folder
router.post('/folder/create', async (req, res) => {
  try {
    const { name, parentPath } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Folder name is required' });
    }

    const folderId = generateId();
    const folderPath = parentPath ? `${parentPath}/${name}` : name;

    const folder = new Folder({
      folderId,
      name,
      path: folderPath,
      parentPath: parentPath || '',
      createdAt: new Date()
    });

    await folder.save();

    res.status(201).json({
      message: 'Folder created successfully',
      folder
    });
  } catch (error) {
    console.error('Create folder error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all folders
router.get('/folders', async (req, res) => {
  try {
    const { parentPath } = req.query;
    const query = parentPath ? { parentPath } : { parentPath: '' };
    
    const folders = await Folder.find(query).sort({ createdAt: -1 });
    res.json({ folders });
  } catch (error) {
    console.error('Get folders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get folder structure (tree view)
router.get('/folders/tree', async (req, res) => {
  try {
    const folders = await Folder.find().sort({ path: 1 });
    res.json({ folders });
  } catch (error) {
    console.error('Get folder tree error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload files to folder
router.post('/files/upload', upload.array('files', 10), async (req, res) => {
  try {
    const { folderPath } = req.body;

    console.log('Upload request received:', { folderPath, filesCount: req.files?.length });

    if (!folderPath) {
      return res.status(400).json({ message: 'Folder path is required' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const uploadedFiles = [];

    for (const file of req.files) {
      const fileId = generateId();
      
      console.log('Uploading file:', file.originalname, 'Type:', file.mimetype);
      const result = await uploadToAzure(file.buffer, folderPath, file.originalname, file.mimetype);
      console.log('Azure upload success:', result.blobUrl);

      const newFile = new File({
        fileId,
        filename: file.originalname,
        folderPath,
        cloudinaryPath: result.blobPath,
        cloudinaryUrl: result.blobUrl,
        fileType: file.mimetype,
        size: file.size,
        uploadedAt: new Date()
      });

      await newFile.save();
      console.log('File saved to DB:', fileId);
      uploadedFiles.push(newFile);
    }

    res.json({
      message: 'Files uploaded successfully',
      files: uploadedFiles
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
});

// Get files in a folder
router.get('/files', async (req, res) => {
  try {
    const { folderPath } = req.query;

    if (!folderPath) {
      return res.status(400).json({ message: 'Folder path is required' });
    }

    const files = await File.find({ folderPath }).sort({ uploadedAt: -1 });
    res.json({ files });
  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all files
router.get('/files/all', async (req, res) => {
  try {
    const files = await File.find().sort({ uploadedAt: -1 });
    res.json({ files });
  } catch (error) {
    console.error('Get all files error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete file
router.delete('/files/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;

    const file = await File.findOne({ fileId });
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Delete from Azure Blob Storage
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(file.cloudinaryPath);
    await blockBlobClient.deleteIfExists();

    await File.deleteOne({ fileId });

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete folder and all its contents
router.delete('/folders/:folderId', async (req, res) => {
  try {
    const { folderId } = req.params;

    const folder = await Folder.findOne({ folderId });
    if (!folder) {
      return res.status(404).json({ message: 'Folder not found' });
    }

    // Find all subfolders
    const subfolders = await Folder.find({ 
      path: { $regex: `^${folder.path}` } 
    });

    // Delete all files in this folder and subfolders
    const folderPaths = [folder.path, ...subfolders.map(f => f.path)];
    const files = await File.find({ folderPath: { $in: folderPaths } });

    const containerClient = blobServiceClient.getContainerClient(containerName);
    
    for (const file of files) {
      try {
        const blockBlobClient = containerClient.getBlockBlobClient(file.cloudinaryPath);
        await blockBlobClient.deleteIfExists();
      } catch (err) {
        console.error('Error deleting file from Azure:', err);
      }
    }

    // Delete files from DB
    await File.deleteMany({ folderPath: { $in: folderPaths } });

    // Delete subfolders from DB
    await Folder.deleteMany({ path: { $regex: `^${folder.path}` } });

    res.json({ message: 'Folder deleted successfully' });
  } catch (error) {
    console.error('Delete folder error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
