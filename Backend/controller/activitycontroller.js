const Activity = require('../models/activity');
const Student = require('../models/studentRegister');
const Event = require('../models/events');

// Register student for event (create activity)
exports.registerForEvent = async (req, res) => {
  try {
    const { studentId, eventId, type, points } = req.body;
    
    // Check if student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ 
        success: false, 
        error: 'Student not found' 
      });
    }
    
    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ 
        success: false, 
        error: 'Event not found' 
      });
    }
    
    // Check if already registered
    const existingActivity = await Activity.findOne({ studentId, eventId });
    if (existingActivity) {
      return res.status(400).json({ 
        success: false, 
        error: 'Student already registered for this event' 
      });
    }
    
    // Check event capacity
    const registeredCount = await Activity.countDocuments({ 
      eventId, 
      status: { $in: ['approved', 'pending'] }
    });
    
    if (registeredCount >= event.maxParticipants) {
      return res.status(400).json({ 
        success: false, 
        error: 'Event is full' 
      });
    }
    
    // Create activity
    const activity = new Activity(req.body);
    await activity.save();
    
    // Add event to student's event list
    if (!student.event.includes(eventId)) {
      student.event.push(eventId);
      await student.save();
    }
    
    res.status(201).json({ 
      success: true, 
      message: 'Successfully registered for event',
      data: activity 
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Get all activities
exports.getAllActivities = async (req, res) => {
  try {
    const activities = await Activity.find()
      .populate('studentId', 'name rollNo department')
      .populate('eventId', 'title date venue');
    
    res.status(200).json({ 
      success: true, 
      count: activities.length,
      data: activities 
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Get activity by ID
exports.getActivityById = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id)
      .populate('studentId', 'name rollNo department year phoneNo')
      .populate('eventId', 'title description date venue incharge');
    
    if (!activity) {
      return res.status(404).json({ 
        success: false, 
        error: 'Activity not found' 
      });
    }
    
    res.status(200).json({ 
      success: true, 
      data: activity 
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Get activities by student
exports.getActivitiesByStudent = async (req, res) => {
  try {
    const activities = await Activity.find({ studentId: req.params.studentId })
      .populate('eventId', 'title date venue')
      .sort({ createdAt: -1 });
    
    res.status(200).json({ 
      success: true, 
      count: activities.length,
      data: activities 
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Get activities by event
exports.getActivitiesByEvent = async (req, res) => {
  try {
    const activities = await Activity.find({ eventId: req.params.eventId })
      .populate('studentId', 'name rollNo department year')
      .sort({ createdAt: -1 });
    
    res.status(200).json({ 
      success: true, 
      count: activities.length,
      data: activities 
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Update activity status
exports.updateActivityStatus = async (req, res) => {
  try {
    const { status, remarks, attendance } = req.body;
    const updateData = { status, remarks, attendance };
    
    if (status === 'completed') {
      updateData.completedAt = new Date();
    }
    
    const activity = await Activity.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!activity) {
      return res.status(404).json({ 
        success: false, 
        error: 'Activity not found' 
      });
    }
    
    res.status(200).json({ 
      success: true, 
      message: 'Activity status updated successfully',
      data: activity 
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Update activity points
exports.updateActivityPoints = async (req, res) => {
  try {
    const { points } = req.body;
    
    const activity = await Activity.findByIdAndUpdate(
      req.params.id,
      { points },
      { new: true, runValidators: true }
    );
    
    if (!activity) {
      return res.status(404).json({ 
        success: false, 
        error: 'Activity not found' 
      });
    }
    
    res.status(200).json({ 
      success: true, 
      message: 'Points updated successfully',
      data: activity 
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Delete activity (unregister from event)
exports.deleteActivity = async (req, res) => {
  try {
    const activity = await Activity.findByIdAndDelete(req.params.id);
    
    if (!activity) {
      return res.status(404).json({ 
        success: false, 
        error: 'Activity not found' 
      });
    }
    
    // Remove event from student's event list
    await Student.findByIdAndUpdate(
      activity.studentId,
      { $pull: { event: activity.eventId } }
    );
    
    res.status(200).json({ 
      success: true, 
      message: 'Activity deleted successfully' 
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Get activities by status
exports.getActivitiesByStatus = async (req, res) => {
  try {
    const activities = await Activity.find({ status: req.params.status })
      .populate('studentId', 'name rollNo')
      .populate('eventId', 'title');
    
    res.status(200).json({ 
      success: true, 
      count: activities.length,
      data: activities 
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Get student's total points
exports.getStudentTotalPoints = async (req, res) => {
  try {
    const result = await Activity.aggregate([
      { 
        $match: { 
          studentId: new mongoose.Types.ObjectId(req.params.studentId),
          status: 'completed'
        } 
      },
      {
        $group: {
          _id: '$studentId',
          totalPoints: { $sum: '$points' },
          activitiesCount: { $sum: 1 },
          averagePoints: { $avg: '$points' }
        }
      }
    ]);
    
    res.status(200).json({ 
      success: true, 
      data: result[0] || { totalPoints: 0, activitiesCount: 0, averagePoints: 0 }
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
};