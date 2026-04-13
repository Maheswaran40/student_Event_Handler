// models/taskActivity.js
const mongoose = require('mongoose');

const taskActivitySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Activity title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: [true, 'Event ID is required']
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Volunteer assignment is required']
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Admin ID is required']
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'completed', 'approved', 'cancelled'],
    default: 'pending'
  },
  priority: {
    type: String,
    required: true,
    enum: ['High', 'Medium', 'Low'],
    default: 'Medium'
  },
  deadline: {
    type: Date,
    required: false
  },
  proof: {
    type: String,
    trim: true,
    default: null
  },
  points: {
    type: Number,
    default: 0,
    min: [0, 'Points cannot be negative']
  },
  remarks: {
    type: String,
    trim: true,
    maxlength: [500, 'Remarks cannot exceed 500 characters']
  },
  completedAt: {
    type: Date
  },
  approvedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for efficient queries
taskActivitySchema.index({ assignedTo: 1, status: 1 });
taskActivitySchema.index({ eventId: 1, status: 1 });
taskActivitySchema.index({ priority: 1, deadline: 1 });

// Pre-save middleware
taskActivitySchema.pre('save', function(next) {
  if (this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
  }
  if (this.status === 'approved' && !this.approvedAt) {
    this.approvedAt = new Date();
  }
  next();
});

// Virtual for activity summary
taskActivitySchema.virtual('summary').get(function() {
  return `${this.title} - Assigned to: ${this.assignedTo} - Status: ${this.status}`;
});

// Method to check if deadline is passed
taskActivitySchema.methods.isOverdue = function() {
  return this.deadline && new Date() > this.deadline && this.status === 'pending';
};

module.exports = mongoose.model('TaskActivity', taskActivitySchema);