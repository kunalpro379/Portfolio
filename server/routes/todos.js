import express from 'express';
import Todo from '../models/Todo.js';

const router = express.Router();

// Generate unique ID
function generateId() {
  return `todo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Get all todos
router.get('/', async (req, res) => {
  try {
    const todos = await Todo.find({}).sort({ createdAt: -1 });
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
