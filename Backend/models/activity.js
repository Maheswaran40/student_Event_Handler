const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'Student ID is required']
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: [true, 'Event ID is required']
  },
  type: {
    type: String,
    required: [true, 'Activity type is required'],
    enum: ['registration', 'participation', 'volunteer', 'organizer', 'winner'],
    default: 'participation'
  },
  points: {
    type: Number,
    required: [true, 'Points are required'],
    min: [0, 'Points cannot be negative'],
    max: [100, 'Points cannot exceed 100'],
    default: 0
  },
  status: {
    type: String,
    required: [true, 'Status is required'],
    enum: ['pending', 'approved', 'rejected', 'completed'],
    default: 'pending'
  },
  remarks: {
    type: String,
    trim: true,
    maxlength: [500, 'Remarks cannot exceed 500 characters']
  },
  attendance: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Compound unique index to prevent duplicate entries
activitySchema.index({ studentId: 1, eventId: 1, type: 1 }, { unique: true });

// Pre-save middleware
activitySchema.pre('save', function(next) {
  if (this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
  }
  next();
});

// Virtual for activity summary
activitySchema.virtual('summary').get(function() {
  return `${this.type} activity for ${this.studentId} at event ${this.eventId} - Points: ${this.points}`;
});

module.exports = mongoose.model('Activity', activitySchema);