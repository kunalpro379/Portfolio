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

const uploadDiagramToAzure = async (diagramData, docId) => {
  try {
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobPath = `documentation/${docId}.tldr`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobPath);
    
    const buffer = Buffer.from(JSON.stringify(diagramData), 'utf-8');
    await blockBlobClient.upload(buffer, buffer.length, {
      blobHTTPHeaders: { blobContentType: 'application/json' },
      overwrite: true
    });
    
    return {
      blobPath,
      blobUrl: blockBlobClient.url
    };
  } catch (error) {
    console.error('Azure diagram upload error:', error);
    throw error;
  }
};

const getDocFromAzure = async (blobPath) => {
  try {
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobPath);
    
    // Check if blob exists first
    const exists = await blockBlobClient.exists();
    if (!exists) {
      console.warn(`Blob not found: ${blobPath}`);
      return null;
    }
    
    const downloadResponse = await blockBlobClient.download(0);
    const content = await streamToString(downloadResponse.readableStreamBody);
    
    return content;
  } catch (error) {
    if (error.statusCode === 404) {
      console.warn(`Blob not found: ${blobPath}`);
      return null;
    }
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
      files: [],
      isPublic: isPublic || false,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await doc.save();

    // Create default files (index.md and index.diagram)
    try {
      // Create index.md
      const mdFileId = generateId();
      const mdBlobPath = `documentation/${docId}/files/${mdFileId}-index.md`;
      const containerClient = blobServiceClient.getContainerClient(containerName);
      const mdBlockBlobClient = containerClient.getBlockBlobClient(mdBlobPath);
      await mdBlockBlobClient.upload(processedContent, processedContent.length, {
        blobHTTPHeaders: { blobContentType: 'text/markdown' },
        overwrite: true
      });

      doc.files.push({
        fileId: mdFileId,
        name: 'index.md',
        type: 'markdown',
        azurePath: mdBlobPath,
        azureUrl: mdBlockBlobClient.url,
        createdAt: new Date()
      });

      // Create index.diagram
      const diagramFileId = generateId();
      const diagramBlobPath = `documentation/${docId}/files/${diagramFileId}-index.tldr`;
      const diagramBlockBlobClient = containerClient.getBlockBlobClient(diagramBlobPath);
      const emptyDiagram = JSON.stringify({ elements: [], appState: {} });
      const diagramBuffer = Buffer.from(emptyDiagram, 'utf-8');
      await diagramBlockBlobClient.upload(diagramBuffer, diagramBuffer.length, {
        blobHTTPHeaders: { blobContentType: 'application/json' },
        overwrite: true
      });

      doc.files.push({
        fileId: diagramFileId,
        name: 'index.diagram',
        type: 'diagram',
        azurePath: diagramBlobPath,
        azureUrl: diagramBlockBlobClient.url,
        createdAt: new Date()
      });

      await doc.save();
    } catch (fileError) {
      console.error('Error creating default files:', fileError);
    }

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
    
    // If blob doesn't exist, return empty content
    if (content === null) {
      content = '';
    }

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

// Upload diagram data
router.post('/:docId/diagram', async (req, res) => {
  try {
    const { docId } = req.params;
    const { diagramData } = req.body;

    if (!diagramData) {
      return res.status(400).json({ message: 'Diagram data is required' });
    }

    const doc = await Documentation.findOne({ docId });
    if (!doc) {
      return res.status(404).json({ message: 'Documentation not found' });
    }

    const { blobPath, blobUrl } = await uploadDiagramToAzure(diagramData, docId);
    
    doc.diagramPath = blobPath;
    doc.diagramUrl = blobUrl;
    doc.updatedAt = new Date();
    await doc.save();

    res.json({
      message: 'Diagram saved successfully',
      diagramUrl: blobUrl
    });
  } catch (error) {
    console.error('Save diagram error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get diagram data
router.get('/:docId/diagram', async (req, res) => {
  try {
    const { docId } = req.params;
    
    const doc = await Documentation.findOne({ docId });
    if (!doc) {
      return res.status(404).json({ message: 'Documentation not found' });
    }

    if (!doc.diagramPath) {
      return res.json({ exists: false, diagramData: null });
    }

    // Fetch diagram from Azure
    const diagramContent = await getDocFromAzure(doc.diagramPath);
    
    // If blob doesn't exist, return empty diagram
    if (diagramContent === null) {
      return res.json({ 
        exists: false, 
        diagramData: null,
        warning: 'Diagram file not found in Azure Blob Storage'
      });
    }
    
    const diagramData = JSON.parse(diagramContent);

    res.json({
      exists: true,
      diagramData,
      diagramUrl: doc.diagramUrl
    });
  } catch (error) {
    console.error('Get diagram error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete diagram
router.delete('/:docId/diagram', async (req, res) => {
  try {
    const { docId } = req.params;

    const doc = await Documentation.findOne({ docId });
    if (!doc) {
      return res.status(404).json({ message: 'Documentation not found' });
    }

    if (doc.diagramPath) {
      const containerClient = blobServiceClient.getContainerClient(containerName);
      const blockBlobClient = containerClient.getBlockBlobClient(doc.diagramPath);
      await blockBlobClient.deleteIfExists();
    }

    doc.diagramPath = '';
    doc.diagramUrl = '';
    doc.updatedAt = new Date();
    await doc.save();

    res.json({ message: 'Diagram deleted successfully' });
  } catch (error) {
    console.error('Delete diagram error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new file (markdown or diagram)
router.post('/:docId/files', async (req, res) => {
  try {
    const { docId } = req.params;
    const { name, type, content } = req.body; // type: 'markdown' or 'diagram'

    const doc = await Documentation.findOne({ docId });
    if (!doc) {
      return res.status(404).json({ message: 'Documentation not found' });
    }

    const fileId = generateId();
    const timestamp = Date.now();
    const fileName = `${fileId}-${name}`;
    
    let azurePath, azureUrl;

    if (type === 'markdown') {
      const blobPath = `documentation/${docId}/files/${fileName}.md`;
      const result = await uploadDocToAzure(content || '', docId);
      azurePath = blobPath;
      azureUrl = result.blobUrl;
    } else if (type === 'diagram') {
      const result = await uploadDiagramToAzure(content || {}, `${docId}/files/${fileId}`);
      azurePath = result.blobPath;
      azureUrl = result.blobUrl;
    }

    const newFile = {
      fileId,
      name,
      type,
      azurePath,
      azureUrl,
      createdAt: new Date()
    };

    if (!doc.files) doc.files = [];
    doc.files.push(newFile);
    doc.updatedAt = new Date();
    await doc.save();

    res.json({ message: 'File created', file: newFile });
  } catch (error) {
    console.error('Create file error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all files for a document
router.get('/:docId/files', async (req, res) => {
  try {
    const { docId } = req.params;
    
    const doc = await Documentation.findOne({ docId });
    if (!doc) {
      return res.status(404).json({ message: 'Documentation not found' });
    }

    res.json({ files: doc.files || [] });
  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single file content
router.get('/:docId/files/:fileId', async (req, res) => {
  try {
    const { docId, fileId } = req.params;
    
    const doc = await Documentation.findOne({ docId });
    if (!doc) {
      return res.status(404).json({ message: 'Documentation not found' });
    }

    const file = doc.files?.find(f => f.fileId === fileId);
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Fetch content from Azure
    const content = await getDocFromAzure(file.azurePath);
    
    // If blob doesn't exist, return empty content
    if (content === null) {
      return res.json({ 
        file: {
          fileId: file.fileId,
          name: file.name,
          type: file.type,
          azurePath: file.azurePath,
          azureUrl: file.azureUrl,
          createdAt: file.createdAt,
          content: file.type === 'diagram' ? {} : '',
          warning: 'File content not found in Azure Blob Storage'
        }
      });
    }
    
    res.json({ 
      file: {
        fileId: file.fileId,
        name: file.name,
        type: file.type,
        azurePath: file.azurePath,
        azureUrl: file.azureUrl,
        createdAt: file.createdAt,
        content: file.type === 'diagram' ? JSON.parse(content) : content
      }
    });
  } catch (error) {
    console.error('Get file error:', error);
    res.status(500).json({ message: 'Server error' });
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

    // Update content in Azure
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(file.azurePath);
    
    if (file.type === 'markdown') {
      await blockBlobClient.upload(content, content.length, {
        blobHTTPHeaders: { blobContentType: 'text/markdown' },
        overwrite: true
      });
    } else if (file.type === 'diagram') {
      const buffer = Buffer.from(JSON.stringify(content), 'utf-8');
      await blockBlobClient.upload(buffer, buffer.length, {
        blobHTTPHeaders: { blobContentType: 'application/json' },
        overwrite: true
      });
    }

    if (name) file.name = name;
    doc.updatedAt = new Date();
    await doc.save();

    res.json({ message: 'File updated', file });
  } catch (error) {
    console.error('Update file error:', error);
    res.status(500).json({ message: 'Server error' });
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
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(file.azurePath);
    await blockBlobClient.deleteIfExists();

    doc.files.splice(fileIndex, 1);
    doc.updatedAt = new Date();
    await doc.save();

    res.json({ message: 'File deleted' });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload attachment
router.post('/:docId/attachments', upload.single('attachment'), async (req, res) => {
  try {
    const { docId } = req.params;
    
    const doc = await Documentation.findOne({ docId });
    if (!doc) {
      return res.status(404).json({ message: 'Documentation not found' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileId = generateId();
    const fileName = req.file.originalname;
    const blobPath = `documentation/${docId}/attachments/${fileId}-${fileName}`;

    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobPath);

    await blockBlobClient.uploadData(req.file.buffer, {
      blobHTTPHeaders: { blobContentType: req.file.mimetype }
    });

    const newFile = {
      fileId,
      name: fileName,
      type: 'attachment',
      azurePath: blobPath,
      azureUrl: blockBlobClient.url,
      createdAt: new Date()
    };

    if (!doc.files) doc.files = [];
    doc.files.push(newFile);
    doc.updatedAt = new Date();
    await doc.save();

    res.json({ message: 'Attachment uploaded', file: newFile });
  } catch (error) {
    console.error('Upload attachment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
