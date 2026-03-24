const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Student name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true,
    enum: ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil', 'Electrical']
  },
  year: {
    type: Number,
    required: [true, 'Year is required'],
    min: [1, 'Year must be between 1 and 4'],
    max: [4, 'Year must be between 1 and 4']
  },
  rollNo: {
    type: String,
    required: [true, 'Roll number is required'],
    unique: true,
    trim: true,
    uppercase: true,
    index: true
  },
  phoneNo: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    match: [/^[0-9]{10}$/, 'Phone number must be exactly 10 digits'],
    trim: true
  },
  event: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  }]
}, {
  timestamps: true
});

// Create indexes for better query performance
studentSchema.index({ department: 1, year: 1 });
studentSchema.index({ rollNo: 1 }, { unique: true });

module.exports = mongoose.model('Student', studentSchema);