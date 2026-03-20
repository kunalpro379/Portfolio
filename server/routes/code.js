import express from 'express';
import { BlobServiceClient } from '@azure/storage-blob';
import { MongoClient, ObjectId } from 'mongodb';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Azure Blob Storage configuration
const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const CONTAINER_NAME = 'code';

// MongoDB configuration
const MONGODB_URI = process.env.MONGODB_URI;
const DATABASE_NAME = 'Portfolio';

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

    console.log('✓ Azure Blob Storage initialized for code');
    return true;
  } catch (error) {
    console.error('Error initializing Azure Blob Storage:', error);
    return false;
  }
}

// Initialize on startup
initializeBlobStorage();

// Helper function to generate unique IDs
function generateId() {
  return `code_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
}

// Helper function to get language from extension
function getLanguageFromExtension(filename) {
  const ext = filename.split('.').pop()?.toLowerCase();
  const languageMap = {
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'py': 'python',
    'java': 'java',
    'cpp': 'cpp',
    'c': 'c',
    'cs': 'csharp',
    'php': 'php',
    'rb': 'ruby',
    'go': 'go',
    'rs': 'rust',
    'html': 'html',
    'css': 'css',
    'scss': 'scss',
    'json': 'json',
    'xml': 'xml',
    'md': 'markdown',
    'sql': 'sql',
    'sh': 'bash',
    'yml': 'yaml',
    'yaml': 'yaml'
  };
  return languageMap[ext] || 'plaintext';
}

// Get folders
router.get('/folders', async (req, res) => {
  try {
    const { parentPath = '' } = req.query;
    
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const db = client.db(DATABASE_NAME);
    const collection = db.collection('codeFolders');
    
    const folders = await collection.find({ parentPath }).sort({ createdAt: -1 }).toArray();
    
    await client.close();
    
    res.json({ folders });
  } catch (error) {
    console.error('Error fetching code folders:', error);
    res.status(500).json({ error: 'Failed to fetch folders' });
  }
});

// Get files in a folder
router.get('/files', async (req, res) => {
  try {
    const { folderPath } = req.query;
    
    if (!folderPath) {
      return res.json({ files: [] });
    }
    
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const db = client.db(DATABASE_NAME);
    const collection = db.collection('codeFiles');
    
    const files = await collection.find({ folderPath }).sort({ createdAt: -1 }).toArray();
    
    await client.close();
    
    res.json({ files });
  } catch (error) {
    console.error('Error fetching code files:', error);
    res.status(500).json({ error: 'Failed to fetch files' });
  }
});

// Create folder
router.post('/folder/create', async (req, res) => {
  try {
    const { name, parentPath = '' } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Folder name is required' });
    }
    
    const folderId = generateId();
    const path = parentPath ? `${parentPath}/${name}` : name;
    
    const folderData = {
      folderId,
      name,
      path,
      parentPath,
      createdAt: new Date().toISOString()
    };
    
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const db = client.db(DATABASE_NAME);
    const collection = db.collection('codeFolders');
    
    await collection.insertOne(folderData);
    
    await client.close();
    
    res.json({ success: true, folder: folderData });
  } catch (error) {
    console.error('Error creating code folder:', error);
    res.status(500).json({ error: 'Failed to create folder' });
  }
});

// Create file - support both /files and /file/create endpoints
router.post('/files', async (req, res) => {
  try {
    const { filename, folderPath, content = '', language } = req.body;
    
    if (!filename || !folderPath) {
      return res.status(400).json({ error: 'Filename and folder path are required' });
    }
    
    const fileId = generateId();
    const detectedLanguage = language || getLanguageFromExtension(filename);
    
    // Store content in Azure Blob Storage
    let blobUrl = '';
    if (containerClient) {
      try {
        const blobName = `${folderPath}/${fileId}_${filename}`;
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        
        await blockBlobClient.upload(content, Buffer.byteLength(content, 'utf8'), {
          blobHTTPHeaders: {
            blobContentType: 'text/plain'
          }
        });
        
        blobUrl = blockBlobClient.url;
      } catch (blobError) {
        console.error('Error uploading to blob storage:', blobError);
      }
    }
    
    const fileData = {
      fileId,
      filename,
      folderPath,
      content,
      language: detectedLanguage,
      size: Buffer.byteLength(content, 'utf8'),
      blobUrl,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const db = client.db(DATABASE_NAME);
    const collection = db.collection('codeFiles');
    
    await collection.insertOne(fileData);
    
    await client.close();
    
    res.json({ success: true, file: fileData });
  } catch (error) {
    console.error('Error creating code file:', error);
    res.status(500).json({ error: 'Failed to create file' });
  }
});

// Create file (legacy endpoint)
router.post('/file/create', async (req, res) => {
  try {
    const { filename, folderPath, content = '', language } = req.body;
    
    if (!filename || !folderPath) {
      return res.status(400).json({ error: 'Filename and folder path are required' });
    }
    
    const fileId = generateId();
    const detectedLanguage = language || getLanguageFromExtension(filename);
    
    // Store content in Azure Blob Storage
    let blobUrl = '';
    if (containerClient) {
      try {
        const blobName = `${folderPath}/${fileId}_${filename}`;
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        
        await blockBlobClient.upload(content, Buffer.byteLength(content, 'utf8'), {
          blobHTTPHeaders: {
            blobContentType: 'text/plain'
          }
        });
        
        blobUrl = blockBlobClient.url;
      } catch (blobError) {
        console.error('Error uploading to blob storage:', blobError);
      }
    }
    
    const fileData = {
      fileId,
      filename,
      folderPath,
      content,
      language: detectedLanguage,
      size: Buffer.byteLength(content, 'utf8'),
      blobUrl,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const db = client.db(DATABASE_NAME);
    const collection = db.collection('codeFiles');
    
    await collection.insertOne(fileData);
    
    await client.close();
    
    res.json({ success: true, file: fileData });
  } catch (error) {
    console.error('Error creating code file:', error);
    res.status(500).json({ error: 'Failed to create file' });
  }
});

// Get file metadata by fileId
router.get('/files/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const db = client.db(DATABASE_NAME);
    const collection = db.collection('codeFiles');
    
    const file = await collection.findOne({ fileId });
    
    await client.close();
    
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    res.json({ file });
  } catch (error) {
    console.error('Error fetching file metadata:', error);
    res.status(500).json({ error: 'Failed to fetch file metadata' });
  }
});

// Get file content
router.get('/files/:fileId/content', async (req, res) => {
  try {
    const { fileId } = req.params;
    
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const db = client.db(DATABASE_NAME);
    const collection = db.collection('codeFiles');
    
    const file = await collection.findOne({ fileId });
    
    await client.close();
    
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    res.json({ content: file.content || '' });
  } catch (error) {
    console.error('Error fetching file content:', error);
    res.status(500).json({ error: 'Failed to fetch file content' });
  }
});

// Update file
router.put('/files/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    const { content } = req.body;
    
    if (content === undefined) {
      return res.status(400).json({ error: 'Content is required' });
    }
    
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const db = client.db(DATABASE_NAME);
    const collection = db.collection('codeFiles');
    
    // Get existing file
    const existingFile = await collection.findOne({ fileId });
    if (!existingFile) {
      await client.close();
      return res.status(404).json({ error: 'File not found' });
    }
    
    // Update blob storage if available
    let blobUrl = existingFile.blobUrl;
    if (containerClient && existingFile.blobUrl) {
      try {
        const blobName = `${existingFile.folderPath}/${fileId}_${existingFile.filename}`;
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        
        await blockBlobClient.upload(content, Buffer.byteLength(content, 'utf8'), {
          blobHTTPHeaders: {
            blobContentType: 'text/plain'
          }
        });
        
        blobUrl = blockBlobClient.url;
      } catch (blobError) {
        console.error('Error updating blob storage:', blobError);
      }
    }
    
    const updateData = {
      content,
      size: Buffer.byteLength(content, 'utf8'),
      blobUrl,
      updatedAt: new Date().toISOString()
    };
    
    await collection.updateOne({ fileId }, { $set: updateData });
    
    await client.close();
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating code file:', error);
    res.status(500).json({ error: 'Failed to update file' });
  }
});

// Delete file
router.delete('/files/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const db = client.db(DATABASE_NAME);
    const collection = db.collection('codeFiles');
    
    // Get file info before deletion
    const file = await collection.findOne({ fileId });
    if (!file) {
      await client.close();
      return res.status(404).json({ error: 'File not found' });
    }
    
    // Delete from blob storage if available
    if (containerClient && file.blobUrl) {
      try {
        const blobName = `${file.folderPath}/${fileId}_${file.filename}`;
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        await blockBlobClient.deleteIfExists();
      } catch (blobError) {
        console.error('Error deleting from blob storage:', blobError);
      }
    }
    
    await collection.deleteOne({ fileId });
    
    await client.close();
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting code file:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

// Delete folder
router.delete('/folders/:folderId', async (req, res) => {
  try {
    const { folderId } = req.params;
    
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const db = client.db(DATABASE_NAME);
    const foldersCollection = db.collection('codeFolders');
    const filesCollection = db.collection('codeFiles');
    
    // Get folder info
    const folder = await foldersCollection.findOne({ folderId });
    if (!folder) {
      await client.close();
      return res.status(404).json({ error: 'Folder not found' });
    }
    
    // Delete all files in this folder and subfolders
    const files = await filesCollection.find({ 
      folderPath: { $regex: `^${folder.path}` } 
    }).toArray();
    
    // Delete files from blob storage
    if (containerClient) {
      for (const file of files) {
        try {
          const blobName = `${file.folderPath}/${file.fileId}_${file.filename}`;
          const blockBlobClient = containerClient.getBlockBlobClient(blobName);
          await blockBlobClient.deleteIfExists();
        } catch (blobError) {
          console.error('Error deleting file from blob storage:', blobError);
        }
      }
    }
    
    // Delete files from database
    await filesCollection.deleteMany({ 
      folderPath: { $regex: `^${folder.path}` } 
    });
    
    // Delete subfolders
    await foldersCollection.deleteMany({ 
      path: { $regex: `^${folder.path}` } 
    });
    
    await client.close();
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting code folder:', error);
    res.status(500).json({ error: 'Failed to delete folder' });
  }
});

// Create folder with language support
router.post('/folders', async (req, res) => {
  try {
    const { name, description, language, parentPath = '', createdAt } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Folder name is required' });
    }
    
    const folderId = generateId();
    const path = parentPath ? `${parentPath}/${name}` : name;
    
    const folderData = {
      folderId,
      name,
      path,
      parentPath,
      description: description || '',
      language: language || 'javascript',
      createdAt: createdAt || new Date().toISOString()
    };
    
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const db = client.db(DATABASE_NAME);
    const collection = db.collection('codeFolders');
    
    await collection.insertOne(folderData);
    
    // Create a default main file based on language
    const defaultContent = getDefaultTemplate(language || 'javascript');
    const defaultFilename = getDefaultFilename(language || 'javascript');
    
    // Create default file
    const fileId = generateId();
    const detectedLanguage = language || getLanguageFromExtension(defaultFilename);
    
    // Store content in Azure Blob Storage
    let blobUrl = '';
    if (containerClient) {
      try {
        const blobName = `${path}/${defaultFilename}`;
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        
        await blockBlobClient.upload(defaultContent, Buffer.byteLength(defaultContent, 'utf8'), {
          blobHTTPHeaders: {
            blobContentType: 'text/plain'
          }
        });
        
        blobUrl = blockBlobClient.url;
      } catch (blobError) {
        console.error('Error uploading to blob storage:', blobError);
      }
    }
    
    const fileData = {
      fileId,
      filename: defaultFilename,
      folderPath: path,
      content: defaultContent,
      language: detectedLanguage,
      size: Buffer.byteLength(defaultContent, 'utf8'),
      blobUrl,
      output: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const filesCollection = db.collection('codeFiles');
    await filesCollection.insertOne(fileData);
    
    await client.close();
    
    res.json({ success: true, folder: folderData, file: fileData });
  } catch (error) {
    console.error('Error creating code folder:', error);
    res.status(500).json({ error: 'Failed to create folder' });
  }
});

// Update file output
router.put('/files/:fileId/output', async (req, res) => {
  try {
    const { fileId } = req.params;
    const { output } = req.body;
    
    if (output === undefined) {
      return res.status(400).json({ error: 'Output is required' });
    }
    
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const db = client.db(DATABASE_NAME);
    const collection = db.collection('codeFiles');
    
    const updateData = {
      output,
      lastRunAt: new Date().toISOString()
    };
    
    await collection.updateOne({ fileId }, { $set: updateData });
    
    await client.close();
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating file output:', error);
    res.status(500).json({ error: 'Failed to update output' });
  }
});

// Get file output
router.get('/files/:fileId/output', async (req, res) => {
  try {
    const { fileId } = req.params;
    
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const db = client.db(DATABASE_NAME);
    const collection = db.collection('codeFiles');
    
    const file = await collection.findOne({ fileId });
    
    await client.close();
    
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    res.json({ output: file.output || '', lastRunAt: file.lastRunAt || null });
  } catch (error) {
    console.error('Error fetching file output:', error);
    res.status(500).json({ error: 'Failed to fetch output' });
  }
});

// Helper function to get default template based on language
function getDefaultTemplate(language) {
  const templates = {
    java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        // Write your code here in the main class only
    }
}`,
    python: `# Write your code here
print("Hello, World!")

# Example: Calculate sum
a = 5
b = 3
print(f"Sum = {a + b}")`,
    javascript: `// Write your code here
console.log("Hello, World!");

// Example: Calculate sum
const a = 5;
const b = 3;
console.log(\`Sum: \${a + b}\`);`,
    cpp: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello World!" << endl;
    
    // Example: Calculate sum
    int a = 5, b = 3;
    cout << "Sum = " << (a + b) << endl;
    
    return 0;
}`,
    c: `#include <stdio.h>

int main() {
    printf("Hello World!\\n");
    
    // Example: Calculate sum
    int a = 5, b = 3;
    printf("Sum = %d\\n", a + b);
    
    return 0;
}`,
    sql: `-- Write your SQL queries here
SELECT NOW();

-- Example: Create and query a table
-- CREATE TABLE users (id INT, name VARCHAR(50));
-- INSERT INTO users VALUES (1, 'John');
-- SELECT * FROM users;`
  };
  
  return templates[language] || templates.javascript;
}

// Helper function to get default filename based on language
function getDefaultFilename(language) {
  const filenames = {
    java: 'Main.java',
    python: 'main.py',
    javascript: 'main.js',
    cpp: 'main.cpp',
    c: 'main.c',
    sql: 'query.sql'
  };
  
  return filenames[language] || 'main.js';
}

export default router;