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
    const { topic, content, points, links } = req.body;

    if (!topic || !topic.trim()) {
      return res.status(400).json({ message: 'Topic is required' });
    }

    const todoId = generateId();
    
    const newTodo = new Todo({
      todoId,
      topic: topic.trim(),
      content: content || '',
      points: points || [],
      links: links || [],
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await newTodo.save();

    res.status(201).json({ 
      message: 'Todo created successfully', 
      todo: newTodo 
    });
  } catch (error) {
    console.error('Create todo error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
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
    const { topic, content, points, links } = req.body;

    const todo = await Todo.findOne({ todoId });
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    // Update fields
    if (topic !== undefined) todo.topic = topic;
    if (content !== undefined) todo.content = content;
    if (points !== undefined) todo.points = points;
    if (links !== undefined) todo.links = links;
    todo.updatedAt = new Date();

    await todo.save();

    res.json({ message: 'Todo updated successfully', todo });
  } catch (error) {
    console.error('Update todo error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Toggle todo point status (cycles through pending -> working -> done -> pending)
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
      point.status = 'done';
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
    
    if (!['pending', 'working', 'done'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be: pending, working, or done' });
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
    if (status === 'done') {
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

// Delete todo
router.delete('/:todoId', async (req, res) => {
  try {
    const { todoId } = req.params;

    const todo = await Todo.findOne({ todoId });
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    await Todo.deleteOne({ todoId });

    res.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    console.error('Delete todo error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
