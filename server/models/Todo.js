import mongoose from 'mongoose';

const todoSchema = new mongoose.Schema({
  todoId: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    default: ''
  },
  links: [{
    name: String,
    url: String
  }],
  txtFilePath: {
    type: String,
    default: ''
  },
  txtFileUrl: {
    type: String,
    default: ''
  },
  folderPath: {
    type: String,
    required: true
  },
  visibility: {
    type: String,
    enum: ['public', 'private'],
    default: 'private'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const Todo = mongoose.model('Todo', todoSchema);

export default Todo;
