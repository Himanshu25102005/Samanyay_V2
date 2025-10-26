const mongoose = require("mongoose");

const taskSchema = mongoose.Schema({
  taskId: {
    type: String,
    unique: true,
    required: false
  },
  caseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Case',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  assignedToName: String, // For quick access without population
  dueDate: Date,
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Done', 'Overdue'],
    default: 'Pending'
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  },
  comments: [{
    text: String,
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user'
    },
    authorName: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  attachments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'document'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Task", taskSchema);





