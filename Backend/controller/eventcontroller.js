const Event = require('../models/events');
const Activity = require('../models/activity');
const Student = require('../models/studentRegister');
const cloudinary = require("../config/cloudnary");
const fs = require("fs");
// Create a new event
// exports.createEvent = async (req, res) => {
//   try {
//     const event = new Event(req.body);
//     await event.save();
//     res.status(201).json({ 
//       success: true, 
//       message: 'Event created successfully',
//       data: event 
//     });
//     res.json({ total: count });
//   } catch (error) {
//     res.status(400).json({ 
//       success: false, 
//       error: error.message 
//     });
//   }
// };
exports.createEvent = async (req, res) => {
  try {
    let imageUrl = "";

    //  (image upload)
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path,{folder:"event"});
      // fs.unlinkSync(req.file.path);
      imageUrl = result.secure_url;

      // attach image to body (so your existing logic works)
      req.body.image = imageUrl;
    }
    console.log(req.file);
    console.log(req.body);
    //  YOUR ORIGINAL CODE (UNCHANGED)
    // BEFORE creating event
if (!req.body.incharge) {
  req.body.incharge = []; // IMPORTANT
}
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


exports.getAllEvents = async (req, res) => {
  try {

    const events = await Event.find()
      .populate("incharge", "name email");

    const eventsWithCount = await Promise.all(
      events.map(async (event) => {
        const count = await Student.countDocuments({ event: event._id });

        return {
          ...event.toObject(),
          registeredCount: count
        };
      })
    );

    const totalEvents = await Event.countDocuments();

    res.status(200).json({
      success: true,
      data: eventsWithCount,
      totalEvents
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
    let updateData = { ...req.body };

    // 🔥 handle image upload
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "event",
      });

      updateData.image = result.secure_url;
    }

    const event = await Event.findByIdAndUpdate(
      req.params.id,
      updateData,
      { returnDocument: "after", runValidators: true }
    );

    console.log("BODY:", req.body);

    if (!event) {
      return res.status(404).json({
        success: false,
        error: "Event not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Event updated successfully",
      data: event,
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
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
    
    // ✅ THIS DELETES THE STUDENTS COMPLETELY
    const deletedStudents = await Student.deleteMany({ event: req.params.id });
    
    console.log(`Deleted ${deletedStudents.deletedCount} students who registered for this event`);

    res.status(200).json({
      success: true,
      message: `Event deleted successfully. ${deletedStudents.deletedCount} students were deleted.`,
      data: {
        studentsDeleted: deletedStudents.deletedCount
      }
    });
  } catch (error) {
    console.error("Delete error:", error);
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