import express from 'express';
import multer from 'multer';
import { BlobServiceClient } from '@azure/storage-blob';
import { Documentation } from '../models/Documentation.js';

const router = express.Router();

const blobServiceClient = BlobServiceClient.fromConnectionString(
  process.env.AZURE_STORAGE_CONNECTION_STRING
);
const containerName = process.env.AZURE_BLOB_CONTAINER_NAME;

const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024
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

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const uploadDocToAzure = async (content, docId) => {
  try {
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobPath = `documentation/${docId}.md`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobPath);
    
    await blockBlobClient.upload(content, content.length, {
      blobHTTPHeaders: { blobContentType: 'text/markdown' },
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

const getDocFromAzure = async (blobPath) => {
  try {
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobPath);
    
    const downloadResponse = await blockBlobClient.download(0);
    const content = await streamToString(downloadResponse.readableStreamBody);
    
    return content;
  } catch (error) {
    console.error('Azure download error:', error);
    throw error;
  }
};

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

router.post('/create', async (req, res) => {
  try {
    const { title, subject, description, tags, date, time, content, isPublic, assets } = req.body;

    if (!title || !subject || !content) {
      return res.status(400).json({ message: 'Title, subject, and content are required' });
    }

    const docId = generateId();
    const slug = generateSlug(title);
    const tagsArray = tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];

    let processedContent = content;
    if (assets) {
      Object.entries(assets).forEach(([name, url]) => {
        const placeholder = new RegExp(`\\(\\{\\{${name}\\}\\}\\)`, 'g');
        processedContent = processedContent.replace(placeholder, `(${url})`);
      });
    }

    const { blobPath, blobUrl } = await uploadDocToAzure(processedContent, docId);
    const assetsMap = new Map(Object.entries(assets || {}));

    const doc = new Documentation({
      docId,
      title,
      subject,
      description: description || '',
      tags: tagsArray,
      date: date || '',
      time: time || '',
      slug,
      azureBlobPath: blobPath,
      azureBlobUrl: blobUrl,
      assets: assetsMap,
      isPublic: isPublic || false,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await doc.save();

    res.status(201).json({
      message: 'Documentation created successfully',
      doc
    });
  } catch (error) {
    console.error('Create documentation error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const docs = await Documentation.find().sort({ createdAt: -1 });
    res.json({ docs });
  } catch (error) {
    console.error('Get documentation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:docId', async (req, res) => {
  try {
    const { docId } = req.params;
    
    const doc = await Documentation.findOne({ docId });
    if (!doc) {
      return res.status(404).json({ message: 'Documentation not found' });
    }

    let content = await getDocFromAzure(doc.azureBlobPath);

    const docObject = doc.toObject();
    const assetsObject = {};
    if (doc.assets && doc.assets.size > 0) {
      doc.assets.forEach((url, name) => {
        assetsObject[name] = url;
        const escapedUrl = escapeRegex(url);
        const urlPattern = new RegExp(`\\(${escapedUrl}\\)`, 'g');
        content = content.replace(urlPattern, `({{${name}}})`);
      });
    }

    res.json({
      doc: {
        ...docObject,
        assets: assetsObject,
        content
      }
    });
  } catch (error) {
    console.error('Get documentation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:docId', async (req, res) => {
  try {
    const { docId } = req.params;
    const { title, subject, description, tags, date, time, content, isPublic, assets } = req.body;

    const doc = await Documentation.findOne({ docId });
    if (!doc) {
      return res.status(404).json({ message: 'Documentation not found' });
    }

    if (content) {
      let processedContent = content;
      if (assets) {
        Object.entries(assets).forEach(([name, url]) => {
          const placeholder = new RegExp(`\\(\\{\\{${name}\\}\\}\\)`, 'g');
          processedContent = processedContent.replace(placeholder, `(${url})`);
        });
      }
      
      console.log('Updating blob with content:', processedContent.substring(0, 200));
      await uploadDocToAzure(processedContent, docId);
      console.log('Blob updated successfully');
    }

    if (title) {
      doc.title = title;
      doc.slug = generateSlug(title);
    }
    if (subject) doc.subject = subject;
    if (description !== undefined) doc.description = description;
    if (tags) doc.tags = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    if (date !== undefined) doc.date = date;
    if (time !== undefined) doc.time = time;
    if (assets) {
      doc.assets = new Map(Object.entries(assets));
    }
    if (typeof isPublic !== 'undefined') doc.isPublic = isPublic;
    doc.updatedAt = new Date();

    await doc.save();

    res.json({
      message: 'Documentation updated successfully',
      doc
    });
  } catch (error) {
    console.error('Update documentation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:docId', async (req, res) => {
  try {
    const { docId } = req.params;

    const doc = await Documentation.findOne({ docId });
    if (!doc) {
      return res.status(404).json({ message: 'Documentation not found' });
    }

    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(doc.azureBlobPath);
    await blockBlobClient.deleteIfExists();

    await Documentation.deleteOne({ docId });

    res.json({ message: 'Documentation deleted successfully' });
  } catch (error) {
    console.error('Delete documentation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/upload-asset', upload.single('asset'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const file = req.file;
    const timestamp = Date.now();
    const fileName = `${timestamp}-${file.originalname}`;
    const blobPath = `documentation/assets/${fileName}`;

    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobPath);

    await blockBlobClient.uploadData(file.buffer, {
      blobHTTPHeaders: { blobContentType: file.mimetype }
    });

    res.json({
      message: 'Asset uploaded successfully',
      url: blockBlobClient.url,
      fileName
    });
  } catch (error) {
    console.error('Asset upload error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/asset/:docId/:assetName', async (req, res) => {
  try {
    const { docId, assetName } = req.params;

    const doc = await Documentation.findOne({ docId });
    if (!doc) {
      return res.status(404).json({ message: 'Documentation not found' });
    }

    if (doc.assets && doc.assets.has(assetName)) {
      const assetUrl = doc.assets.get(assetName);
      doc.assets.delete(assetName);
      await doc.save();

      try {
        const urlParts = assetUrl.split('/');
        const fileName = urlParts[urlParts.length - 1];
        const blobPath = `documentation/assets/${fileName}`;
        
        const containerClient = blobServiceClient.getContainerClient(containerName);
        const blockBlobClient = containerClient.getBlockBlobClient(blobPath);
        await blockBlobClient.deleteIfExists();
      } catch (azureError) {
        console.error('Error deleting asset from Azure:', azureError);
      }

      res.json({ message: 'Asset deleted successfully' });
    } else {
      res.status(404).json({ message: 'Asset not found' });
    }
  } catch (error) {
    console.error('Delete asset error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get files for a documentation
router.get('/:docId/files', async (req, res) => {
  try {
    const { docId } = req.params;
    
    console.log('Fetching files for docId:', docId);
    
    const doc = await Documentation.findOne({ docId }).lean();
    if (!doc) {
      console.log('Document not found:', docId);
      return res.status(404).json({ message: 'Documentation not found' });
    }
    
    console.log('Found document with files:', doc.files?.length || 0);
    res.json({ files: doc.files || [] });
  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create a new file
router.post('/:docId/files', async (req, res) => {
  try {
    const { docId } = req.params;
    const { name, type, content } = req.body;

    console.log('Creating file:', { docId, name, type });

    if (!name || !type) {
      console.log('Missing name or type');
      return res.status(400).json({ message: 'Name and type are required' });
    }

    const doc = await Documentation.findOne({ docId });
    if (!doc) {
      console.log('Document not found for file creation:', docId);
      return res.status(404).json({ message: 'Documentation not found' });
    }

    // Check if file already exists (check both with and without extension)
    const cleanName = name.replace(/\.(md|excalidraw)$/, '');
    const existingFile = doc.files?.find(f => {
      const fName = f.name.replace(/\.(md|excalidraw)$/, '');
      return fName === cleanName && f.type === type;
    });
    
    if (existingFile) {
      console.log('File already exists:', cleanName, type);
      return res.status(200).json({ message: 'File already exists', file: existingFile });
    }

    const fileId = generateId();
    const fileExtension = type === 'markdown' ? 'md' : (type === 'diagram' ? 'excalidraw' : 'txt');
    const blobPath = `documentation/${docId}/files/${fileId}.${fileExtension}`;
    
    console.log('Uploading to Azure:', blobPath);
    
    // Upload to Azure
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobPath);
    
    const fileContent = content || (type === 'markdown' ? '# New Document\n\nStart writing...' : '{"type":"excalidraw","version":2,"source":"","elements":[],"appState":{"gridSize":null,"viewBackgroundColor":"#ffffff"}}');
    
    await blockBlobClient.upload(fileContent, fileContent.length, {
      blobHTTPHeaders: { blobContentType: type === 'markdown' ? 'text/markdown' : 'application/json' },
      overwrite: true
    });

    const newFile = {
      fileId,
      name: cleanName,
      type,
      azurePath: blobPath,
      azureUrl: blockBlobClient.url,
      createdAt: new Date()
    };

    if (!doc.files) {
      doc.files = [];
    }
    doc.files.push(newFile);
    await doc.save();

    console.log('File created successfully:', fileId);
    res.status(201).json({ message: 'File created successfully', file: newFile });
  } catch (error) {
    console.error('Create file error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get specific file content
router.get('/:docId/files/:fileId', async (req, res) => {
  try {
    const { docId, fileId } = req.params;
    
    console.log('Fetching file:', { docId, fileId });
    
    const doc = await Documentation.findOne({ docId }).lean();
    if (!doc) {
      console.log('Document not found:', docId);
      return res.status(404).json({ message: 'Documentation not found' });
    }

    const file = doc.files?.find(f => f.fileId === fileId);
    if (!file) {
      console.log('File not found in document:', fileId);
      console.log('Available files:', doc.files?.map(f => ({ fileId: f.fileId, name: f.name })));
      return res.status(404).json({ message: 'File not found' });
    }

    console.log('Found file:', { fileId: file.fileId, name: file.name, azurePath: file.azurePath });

    // Get file content from Azure
    try {
      const containerClient = blobServiceClient.getContainerClient(containerName);
      const blockBlobClient = containerClient.getBlockBlobClient(file.azurePath);
      
      // Check if blob exists
      const exists = await blockBlobClient.exists();
      if (!exists) {
        console.log('Blob does not exist in Azure:', file.azurePath);
        // Create default content based on file type
        const defaultContent = file.type === 'markdown' 
          ? '# New Document\n\nStart writing...' 
          : '{"type":"excalidraw","version":2,"source":"","elements":[],"appState":{"gridSize":null,"viewBackgroundColor":"#ffffff"}}';
        
        // Upload default content
        await blockBlobClient.upload(defaultContent, defaultContent.length, {
          blobHTTPHeaders: { blobContentType: file.type === 'markdown' ? 'text/markdown' : 'application/json' },
          overwrite: true
        });
        
        console.log('Created default content for blob:', file.azurePath);
        
        return res.json({ 
          file: {
            ...file,
            content: defaultContent
          }
        });
      }
      
      const downloadResponse = await blockBlobClient.download(0);
      const content = await streamToString(downloadResponse.readableStreamBody);
      
      console.log('Successfully downloaded file content, length:', content.length);
      
      res.json({ 
        file: {
          ...file,
          content
        }
      });
    } catch (azureError) {
      console.error('Error downloading file from Azure:', azureError);
      res.status(500).json({ message: 'Error downloading file content', error: azureError.message });
    }
  } catch (error) {
    console.error('Get file error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update file content
router.put('/:docId/files/:fileId', async (req, res) => {
  try {
    const { docId, fileId } = req.params;
    const { content, name } = req.body;

    const doc = await Documentation.findOne({ docId });
    if (!doc) {
      return res.status(404).json({ message: 'Documentation not found' });
    }

    const file = doc.files?.find(f => f.fileId === fileId);
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Update content in Azure if provided
    if (content !== undefined) {
      const containerClient = blobServiceClient.getContainerClient(containerName);
      const blockBlobClient = containerClient.getBlockBlobClient(file.azurePath);
      
      await blockBlobClient.upload(content, content.length, {
        blobHTTPHeaders: { blobContentType: file.type === 'markdown' ? 'text/markdown' : 'application/json' },
        overwrite: true
      });
    }

    // Update name if provided
    if (name) {
      file.name = name;
    }

    await doc.save();

    res.json({ message: 'File updated successfully', file });
  } catch (error) {
    console.error('Update file error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete file
router.delete('/:docId/files/:fileId', async (req, res) => {
  try {
    const { docId, fileId } = req.params;

    const doc = await Documentation.findOne({ docId });
    if (!doc) {
      return res.status(404).json({ message: 'Documentation not found' });
    }

    const fileIndex = doc.files?.findIndex(f => f.fileId === fileId);
    if (fileIndex === -1 || fileIndex === undefined) {
      return res.status(404).json({ message: 'File not found' });
    }

    const file = doc.files[fileIndex];

    // Delete from Azure
    try {
      const containerClient = blobServiceClient.getContainerClient(containerName);
      const blockBlobClient = containerClient.getBlockBlobClient(file.azurePath);
      await blockBlobClient.deleteIfExists();
    } catch (azureError) {
      console.error('Error deleting file from Azure:', azureError);
    }

    doc.files.splice(fileIndex, 1);
    await doc.save();

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
