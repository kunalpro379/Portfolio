import mongoose from 'mongoose';

const todoPointSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'working', 'resolved' ],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  assignee: {
    type: String,
    default: ''
  },
  dueDate: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  notes: {
    type: String,
    default: ''
  },
  customFields: {
    type: Map,
    of: String,
    default: {}
  }
}, { _id: true });

const todoLinkSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  }
}, { _id: true });

const columnSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['text', 'select', 'date', 'number'],
    default: 'text'
  },
  options: [String], // For select type
  visible: {
    type: Boolean,
    default: true
  },
  width: {
    type: Number,
    default: 150
  }
}, { _id: false });

const todoSchema = new mongoose.Schema({
  todoId: {
    type: String,
    required: true,
    unique: true,
    default: () => `todo_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
  },
  topic: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    default: ''
  },
  points: [todoPointSchema],
  links: [todoLinkSchema],
  customColumns: [columnSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Add index for faster queries
todoSchema.index({ createdAt: -1 });
todoSchema.index({ todoId: 1 });

// Method to calculate completion percentage
todoSchema.methods.getCompletionStats = function() {
  const total = this.points.length;
  if (total === 0) return { total: 0, resolved: 0, working: 0, pending: 0, percentage: 0 };
  
  const resolved = this.points.filter(p => p.status === 'resolved').length;
  const working = this.points.filter(p => p.status === 'working').length;
  const pending = this.points.filter(p => p.status === 'pending').length;
  const percentage = Math.round((resolved / total) * 100);
  
  return { total, resolved, working, pending, percentage };
};

// Static method to get overall performance stats
todoSchema.statics.getPerformanceStats = async function() {
  const todos = await this.find({});
  
  let totalPoints = 0;
  let resolvedPoints = 0;
  let workingPoints = 0;
  let pendingPoints = 0;
  
  todos.forEach(todo => {
    todo.points.forEach(point => {
      totalPoints++;
      if (point.status === 'resolved') resolvedPoints++;
      else if (point.status === 'working') workingPoints++;
      else if (point.status === 'pending') pendingPoints++;
    });
  });
  
  const overallPercentage = totalPoints > 0 ? Math.round((resolvedPoints / totalPoints) * 100) : 0;
  
  return {
    totalTodos: todos.length,
    totalPoints,
    resolvedPoints,
    workingPoints,
    pendingPoints,
    overallPercentage,
    completedTodos: todos.filter(t => {
      const stats = t.getCompletionStats();
      return stats.percentage === 100;
    }).length
  };
};

const Todo = mongoose.model('Todo', todoSchema);

export default Todo;
