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

// Configure multer for memory storage with 50MB limit per chunk
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB per chunk (Vercel limit)
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

// Get single folder with files
router.get('/folders/:folderId', async (req, res) => {
  try {
    const { folderId } = req.params;

    const folder = await Folder.findOne({ folderId });
    if (!folder) {
      return res.status(404).json({ message: 'Folder not found' });
    }

    console.log('Folder found:', folder.path);

    // Get files in this folder
    const files = await File.find({ folderPath: folder.path }).sort({ uploadedAt: -1 });
    console.log('Files found:', files.length, 'for path:', folder.path);

    // Get subfolders
    const subfolders = await Folder.find({ parentPath: folder.path }).sort({ name: 1 });
    console.log('Subfolders found:', subfolders.length);

    res.json({
      folder: {
        ...folder.toObject(),
        files,
        subfolders
      }
    });
  } catch (error) {
    console.error('Get folder error:', error);
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

// Chunked upload - Initialize
router.post('/files/upload/init', async (req, res) => {
  try {
    const { filename, fileType, fileSize, folderPath } = req.body;

    if (!filename || !folderPath) {
      return res.status(400).json({ message: 'Filename and folder path are required' });
    }

    const uploadId = generateId();

    res.json({
      uploadId,
      chunkSize: 10 * 1024 * 1024, // 10MB chunks for better performance
      message: 'Upload initialized'
    });
  } catch (error) {
    console.error('Init upload error:', error);
    res.status(500).json({ message: 'Failed to initialize upload', error: error.message });
  }
});

// Chunked upload - Upload chunk
router.post('/files/upload/chunk', upload.single('chunk'), async (req, res) => {
  try {
    const { uploadId, chunkIndex, totalChunks, filename, folderPath, fileType } = req.body;

    if (!uploadId || !req.file) {
      return res.status(400).json({ message: 'Upload ID and chunk are required' });
    }

    console.log(`Chunk ${parseInt(chunkIndex) + 1}/${totalChunks} received for ${filename} (${(req.file.buffer.length / 1024 / 1024).toFixed(2)}MB)`);

    // Upload chunk to Azure as temporary block
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobPath = `notes/${folderPath}/${filename}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobPath);

    // Create block ID (must be base64 encoded and same length for all blocks)
    const blockId = Buffer.from(`block-${uploadId}-${String(chunkIndex).padStart(6, '0')}`).toString('base64');

    // Upload block with retry logic
    let retries = 3;
    while (retries > 0) {
      try {
        await blockBlobClient.stageBlock(blockId, req.file.buffer, req.file.buffer.length);
        break;
      } catch (error) {
        retries--;
        if (retries === 0) throw error;
        console.log(`Retrying chunk ${chunkIndex}, ${retries} attempts left`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    res.json({
      message: 'Chunk uploaded',
      chunkIndex: parseInt(chunkIndex),
      blockId
    });
  } catch (error) {
    console.error('Chunk upload error:', error);
    res.status(500).json({ message: 'Chunk upload failed', error: error.message });
  }
});

// Chunked upload - Finalize
router.post('/files/upload/finalize', async (req, res) => {
  try {
    const { uploadId, filename, folderPath, fileType, fileSize, blockIds } = req.body;

    if (!uploadId || !filename || !folderPath || !blockIds) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    console.log(`Finalizing upload for ${filename} with ${blockIds.length} blocks`);

    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobPath = `notes/${folderPath}/${filename}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobPath);

    // Commit all blocks
    await blockBlobClient.commitBlockList(blockIds, {
      blobHTTPHeaders: { blobContentType: fileType }
    });

    console.log('Blocks committed successfully');

    // Save to database
    const fileId = generateId();
    const newFile = new File({
      fileId,
      filename,
      folderPath,
      cloudinaryPath: blobPath,
      cloudinaryUrl: blockBlobClient.url,
      fileType,
      size: parseInt(fileSize),
      uploadedAt: new Date()
    });

    await newFile.save();
    console.log('File saved to DB:', fileId);

    res.json({
      message: 'Upload completed successfully',
      file: newFile
    });
  } catch (error) {
    console.error('Finalize upload error:', error);
    res.status(500).json({ message: 'Failed to finalize upload', error: error.message });
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

// Get single file with content
router.get('/files/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;

    const file = await File.findOne({ fileId });
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Download content from Azure
    try {
      const containerClient = blobServiceClient.getContainerClient(containerName);
      const blockBlobClient = containerClient.getBlockBlobClient(file.cloudinaryPath);

      const downloadResponse = await blockBlobClient.download(0);
      const content = await streamToString(downloadResponse.readableStreamBody);

      res.json({
        file: {
          ...file.toObject(),
          content
        }
      });
    } catch (azureError) {
      console.error('Azure download error:', azureError);
      // Return file info without content if download fails
      res.json({
        file: {
          ...file.toObject(),
          content: ''
        }
      });
    }
  } catch (error) {
    console.error('Get file error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to convert stream to string
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
