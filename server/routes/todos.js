import express from 'express';
import Todo from '../models/Todo.js';
import Password from '../models/Password.js';

const router = express.Router();

// Generate unique ID
function generateId() {
  return `todo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Get all todos (limited info for list view)
router.get('/', async (req, res) => {
  try {
    const todos = await Todo.find({}).sort({ createdAt: -1 });
    
    // Return only summary information for list view
    const todosSummary = todos.map(todo => {
      const points = todo.points || [];
      const resolvedCount = points.filter(p => p.status === 'resolved').length;
      const workingCount = points.filter(p => p.status === 'working').length;
      const pendingCount = points.filter(p => p.status === 'pending').length;
      
      return {
        todoId: todo.todoId,
        topic: todo.topic,
        isPublic: todo.isPublic !== undefined ? todo.isPublic : true,
        pointsCount: points.length,
        resolvedCount,
        workingCount,
        pendingCount,
        linksCount: (todo.links || []).length,
        createdAt: todo.createdAt,
        updatedAt: todo.updatedAt
      };
    });
    
    res.json({ todos: todosSummary });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get performance stats
router.get('/stats/performance', async (req, res) => {
  try {
    const stats = await Todo.getPerformanceStats();
    res.json(stats);
  } catch (error) {
    console.error('Get performance stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new todo
router.post('/', async (req, res) => {
  try {
    const { topic, content, points, links, isPublic } = req.body;

    if (!topic || !topic.trim()) {
      return res.status(400).json({ message: 'Topic is required' });
    }

    const todoId = generateId();
    
    const newTodo = new Todo({
      todoId,
      topic: topic.trim(),
      content: content || '',
      isPublic: isPublic !== undefined ? isPublic : true,
      points: points || [],
      links: links || [],
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await newTodo.save();

    res.status(201).json({ 
      message: 'Task created successfully', 
      todo: newTodo 
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single todo (with password check for private todos)
router.get('/:todoId', async (req, res) => {
  try {
    const { todoId } = req.params;
    const { password } = req.query;
    
    const todo = await Todo.findOne({ todoId });

    if (!todo) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if todo is private and password is required
    if (todo.isPublic === false) {
      if (!password) {
        return res.status(401).json({ 
          message: 'Password required for private task',
          isPrivate: true
        });
      }
      
      const isValid = await Password.verifyPassword('TODO_PASSWORD', password);
      if (!isValid) {
        return res.status(401).json({ 
          message: 'Password required for private task',
          isPrivate: true
        });
      }
    }

    res.json({ todo });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update todo
router.put('/:todoId', async (req, res) => {
  try {
    const { todoId } = req.params;
    const { topic, content, points, links, isPublic, customColumns } = req.body;

    const todo = await Todo.findOne({ todoId });
    if (!todo) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Update fields
    if (topic !== undefined) todo.topic = topic;
    if (content !== undefined) todo.content = content;
    if (points !== undefined) todo.points = points;
    if (links !== undefined) todo.links = links;
    if (isPublic !== undefined) todo.isPublic = isPublic;
    if (customColumns !== undefined) todo.customColumns = customColumns;
    todo.updatedAt = new Date();

    await todo.save();

    res.json({ message: 'Task updated successfully', todo });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Toggle todo point status (cycles through pending -> working -> resolved -> pending)
router.put('/:todoId/points/:index/toggle', async (req, res) => {
  try {
    const { todoId, index } = req.params;
    
    const todo = await Todo.findOne({ todoId });
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    const pointIndex = parseInt(index);
    if (isNaN(pointIndex) || pointIndex < 0 || pointIndex >= todo.points.length) {
      return res.status(400).json({ message: 'Invalid point index' });
    }

    const point = todo.points[pointIndex];
    
    // Cycle through statuses
    if (point.status === 'pending') {
      point.status = 'working';
    } else if (point.status === 'working') {
      point.status = 'resolved';
      point.completedAt = new Date();
    } else {
      point.status = 'pending';
      point.completedAt = undefined;
    }

    todo.updatedAt = new Date();
    await todo.save();

    res.json({ message: 'Point status updated', todo });
  } catch (error) {
    console.error('Toggle point error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update specific point status
router.put('/:todoId/points/:index/status', async (req, res) => {
  try {
    const { todoId, index } = req.params;
    const { status } = req.body;
    
    if (!['pending', 'working', 'resolved'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be: pending, working, or resolved' });
    }

    const todo = await Todo.findOne({ todoId });
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    const pointIndex = parseInt(index);
    if (isNaN(pointIndex) || pointIndex < 0 || pointIndex >= todo.points.length) {
      return res.status(400).json({ message: 'Invalid point index' });
    }

    todo.points[pointIndex].status = status;
    if (status === 'resolved') {
      todo.points[pointIndex].completedAt = new Date();
    } else {
      todo.points[pointIndex].completedAt = undefined;
    }

    todo.updatedAt = new Date();
    await todo.save();

    res.json({ message: 'Point status updated', todo });
  } catch (error) {
    console.error('Update point status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete todo (with password confirmation)
router.delete('/:todoId', async (req, res) => {
  try {
    const { todoId } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(401).json({ message: 'Password required' });
    }

    const isValid = await Password.verifyPassword('TODO_PASSWORD', password);
    if (!isValid) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    const todo = await Todo.findOne({ todoId });
    if (!todo) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await Todo.deleteOne({ todoId });

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
