const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters long'],
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Event description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  date: {
    type: Date,
    required: [true, 'Event date is required'],
    validate: {
      validator: function(v) {
        return v > new Date();
      },
      message: 'Event date must be in the future'
    }
  },
  venue: {
    type: String,
    required: [true, 'Venue is required'],
    trim: true
  },
  incharge: {
    type: String,
    required: [true, 'Event incharge is required'],
    trim: true
  },
  maxParticipants: {
    type: Number,
    default: 10,
    min: [1, 'Max participants must be at least 1']
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  image:{
    type: String,
    require:[true, 'Event image is required']
  }
}, {
  timestamps: true
});

// Virtual for checking if event is full
eventSchema.virtual('isFull').get(function() {
  return this.participants && this.participants.length >= this.maxParticipants;
});

// Create indexes
eventSchema.index({ date: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Event', eventSchema);