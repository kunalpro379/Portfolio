import mongoose from 'mongoose';

const todoPointSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'working', 'done'],
    default: 'pending'
  },
  completedAt: {
    type: Date
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

const todoSchema = new mongoose.Schema({
  todoId: {
    type: String,
    required: true,
    unique: true,
    default: () => `todo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
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
  if (total === 0) return { total: 0, done: 0, working: 0, pending: 0, percentage: 0 };
  
  const done = this.points.filter(p => p.status === 'done').length;
  const working = this.points.filter(p => p.status === 'working').length;
  const pending = this.points.filter(p => p.status === 'pending').length;
  const percentage = Math.round((done / total) * 100);
  
  return { total, done, working, pending, percentage };
};

// Static method to get overall performance stats
todoSchema.statics.getPerformanceStats = async function() {
  const todos = await this.find({});
  
  let totalPoints = 0;
  let donePoints = 0;
  let workingPoints = 0;
  let pendingPoints = 0;
  
  todos.forEach(todo => {
    todo.points.forEach(point => {
      totalPoints++;
      if (point.status === 'done') donePoints++;
      else if (point.status === 'working') workingPoints++;
      else if (point.status === 'pending') pendingPoints++;
    });
  });
  
  const overallPercentage = totalPoints > 0 ? Math.round((donePoints / totalPoints) * 100) : 0;
  
  return {
    totalTodos: todos.length,
    totalPoints,
    donePoints,
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
