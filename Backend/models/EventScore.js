const mongoose = require('mongoose');

const eventScoreSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  score: {
    type: Number,
    default: 0,
    min: 0
  },
  status: {
    type: String,
    default: 'Pending',
    enum: ['winner', 'runnerup', 'participated', 'disqualified']
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Create a compound index to ensure unique combination of eventId and studentId

eventScoreSchema.index({ eventId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('EventScore', eventScoreSchema);