const Event = require('../models/events');
const Activity = require('../models/activity');
const Student = require('../models/studentRegister');

// Create a new event
exports.createEvent = async (req, res) => {
  try {
    const event = new Event(req.body);
    await event.save();
    res.status(201).json({ 
      success: true, 
      message: 'Event created successfully',
      data: event 
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Get all events
exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find();
    res.status(200).json({ 
      success: true, 
      count: events.length,
      data: events 
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Get event by ID
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ 
        success: false, 
        error: 'Event not found' 
      });
    }
    
    // Get participants count
    const participantsCount = await Activity.countDocuments({ 
      eventId: req.params.id,
      status: 'approved'
    });
    
    res.status(200).json({ 
      success: true, 
      data: {
        ...event.toObject(),
        participantsCount
      }
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Update event
exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!event) {
      return res.status(404).json({ 
        success: false, 
        error: 'Event not found' 
      });
    }
    res.status(200).json({ 
      success: true, 
      message: 'Event updated successfully',
      data: event 
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Delete event
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) {
      return res.status(404).json({ 
        success: false, 
        error: 'Event not found' 
      });
    }
    
    // Delete associated activities
    await Activity.deleteMany({ eventId: req.params.id });
    // Remove event reference from students
    await Student.updateMany(
      { event: req.params.id },
      { $pull: { event: req.params.id } }
    );
    
    res.status(200).json({ 
      success: true, 
      message: 'Event deleted successfully' 
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Get events by status
exports.getEventsByStatus = async (req, res) => {
  try {
    const events = await Event.find({ status: req.params.status });
    res.status(200).json({ 
      success: true, 
      count: events.length,
      data: events 
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Get upcoming events
exports.getUpcomingEvents = async (req, res) => {
  try {
    const events = await Event.find({ 
      date: { $gt: new Date() },
      status: 'upcoming'
    }).sort({ date: 1 });
    res.status(200).json({ 
      success: true, 
      count: events.length,
      data: events 
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Get event participants
exports.getEventParticipants = async (req, res) => {
  try {
    const activities = await Activity.find({ 
      eventId: req.params.id,
      status: 'approved'
    }).populate('studentId', 'name rollNo department year phoneNo');
    
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