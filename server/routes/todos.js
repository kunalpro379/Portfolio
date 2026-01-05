import express from 'express';
import { BlobServiceClient } from '@azure/storage-blob';
import Todo from '../models/Todo.js';

const router = express.Router();

// Initialize Azure Blob Storage client
const blobServiceClient = BlobServiceClient.fromConnectionString(
  process.env.AZURE_STORAGE_CONNECTION_STRING
);
const containerName = process.env.AZURE_BLOB_CONTAINER_NAME;

// Generate 20 character ID
function generateId() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 20; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

// Upload text file to Azure
const uploadTxtToAzure = async (content, folderPath, filename) => {
  try {
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobPath = `todos/${folderPath}/${filename}.txt`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobPath);

    const buffer = Buffer.from(content, 'utf-8');
    await blockBlobClient.upload(buffer, buffer.length, {
      blobHTTPHeaders: { blobContentType: 'text/plain' }
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

// Create new todo
router.post('/create', async (req, res) => {
  try {
    const { todoId, title, content, links, folderPath, visibility } = req.body;

    if (!title || !folderPath) {
      return res.status(400).json({ message: 'Title and folder path are required' });
    }

    // Use provided todoId or generate new one
    const finalTodoId = todoId || generateId();

    // Upload txt file to Azure if content exists
    let txtFilePath = '';
    let txtFileUrl = '';

    if (content) {
      const result = await uploadTxtToAzure(content, folderPath, finalTodoId);
      txtFilePath = result.blobPath;
      txtFileUrl = result.blobUrl;
    }

    const todo = new Todo({
      todoId: finalTodoId,
      title,
      content,
      links: links || [],
      txtFilePath,
      txtFileUrl,
      folderPath,
      visibility: visibility || 'private',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await todo.save();

    res.status(201).json({
      message: 'Todo created successfully',
      todo
    });
  } catch (error) {
    console.error('Create todo error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all todos
router.get('/', async (req, res) => {
  try {
    const { folderPath } = req.query;

    const query = folderPath ? { folderPath } : {};
    const todos = await Todo.find(query).sort({ createdAt: -1 });

    res.json({ todos });
  } catch (error) {
    console.error('Get todos error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single todo
router.get('/:todoId', async (req, res) => {
  try {
    const { todoId } = req.params;
    const todo = await Todo.findOne({ todoId });

    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    res.json({ todo });
  } catch (error) {
    console.error('Get todo error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update todo
router.put('/:todoId', async (req, res) => {
  try {
    const { todoId } = req.params;
    const { title, content, links, visibility } = req.body;

    const todo = await Todo.findOne({ todoId });
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    // Update txt file if content changed
    if (content && content !== todo.content) {
      // Delete old file if exists
      if (todo.txtFilePath) {
        try {
          const containerClient = blobServiceClient.getContainerClient(containerName);
          const blockBlobClient = containerClient.getBlockBlobClient(todo.txtFilePath);
          await blockBlobClient.deleteIfExists();
        } catch (err) {
          console.error('Error deleting old txt file:', err);
        }
      }

      // Upload new file
      const result = await uploadTxtToAzure(content, todo.folderPath, todoId);
      todo.txtFilePath = result.blobPath;
      todo.txtFileUrl = result.blobUrl;
    }

    // Update fields
    todo.title = title || todo.title;
    todo.content = content || todo.content;
    todo.links = links || todo.links;
    todo.visibility = visibility || todo.visibility;
    todo.updatedAt = new Date();

    await todo.save();

    res.json({ message: 'Todo updated successfully', todo });
  } catch (error) {
    console.error('Update todo error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete todo
router.delete('/:todoId', async (req, res) => {
  try {
    const { todoId } = req.params;

    const todo = await Todo.findOne({ todoId });
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    // Delete txt file from Azure if exists
    if (todo.txtFilePath) {
      try {
        const containerClient = blobServiceClient.getContainerClient(containerName);
        const blockBlobClient = containerClient.getBlockBlobClient(todo.txtFilePath);
        await blockBlobClient.deleteIfExists();
      } catch (err) {
        console.error('Error deleting txt file from Azure:', err);
      }
    }

    await Todo.deleteOne({ todoId });

    res.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    console.error('Delete todo error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
