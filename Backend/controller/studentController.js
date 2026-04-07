const Student = require('../models/studentRegister');
const Activity = require('../models/activity');
const Event = require("../models/events")
// Create a new student
exports.createStudent = async (req, res) => {
  try {
    console.log('Request body:', req.body);
    const { event, ...studentData } = req.body;
    const eventData = await Event.findById(event)
    if (!eventData) {
      return res.status(404).json({
        success: false,
        error: "Event Not Found"
      })
    }
    // Check current participants count for this event
    const currentParticipants = await Student.countDocuments({ event });

    if (currentParticipants >= event.maxParticipants) {
      return res.status(409).json({
        success: false,
        error: 'Registration closed',
        message: `Event has reached maximum capacity of ${event.maxParticipants} participants`,
        closed: true,
        maxParticipants: event.maxParticipants,
        currentParticipants: currentParticipants
      });
    }

    const student = new Student({ ...studentData, event });
    await student.save();
    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: student
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Get all students
exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.find().populate('event', 'title date maxParticipants');
    const TotalStudent = students.length
    console.log("TotalStudent", TotalStudent);
students.forEach(s => {
  if (!s.event) {
    console.log("Missing event:", s._id,s.title);
  }
});

    const studentsByEvent = await Student.aggregate([
      {
        $unwind: "$event" // 🔥 FIX (very important)
      },
      {
        $group: {
          _id: "$event",
          registeredCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "events", // ⚠️ your MongoDB collection name (check lowercase)
          localField: "_id",
          foreignField: "_id",
          as: "event"
        }
      },
      {
        $unwind: "$event"
      },
      {
        $project: {
          _id: 0,
          eventId: "$_id",
          title: "$event.title",
          date: "$event.date",
          maxParticipants: "$event.maxParticipants",
          registeredCount: 1,
          isFull: {
            $gte: ["$registeredCount", "$event.maxParticipants"]
          }
        }
      }
    ]);
    console.log("studentsByEvent", studentsByEvent)
    res.status(200).json({
      success: true,
      count: students.length,
      data: studentsByEvent,
      students
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Get student by ID
exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate('event', 'title date venue');
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }
    res.status(200).json({
      success: true,
      data: student
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Update student
exports.updateStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      data: student
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Delete student
exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }
    // Delete associated activities
    await Activity.deleteMany({ studentId: req.params.id });
    res.status(200).json({
      success: true,
      message: 'Student deleted successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Get students by department
exports.getStudentsByDepartment = async (req, res) => {
  try {
    const students = await Student.find({ department: req.params.department });
    res.status(200).json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Get students by year
exports.getStudentsByYear = async (req, res) => {
  try {
    const students = await Student.find({ year: parseInt(req.params.year) });
    res.status(200).json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Get student points summary
exports.getStudentPointsSummary = async (req, res) => {
  try {
    const activities = await Activity.find({
      studentId: req.params.id,
      status: 'completed'
    });

    const totalPoints = activities.reduce((sum, activity) => sum + activity.points, 0);
    const pointsByType = activities.reduce((acc, activity) => {
      acc[activity.type] = (acc[activity.type] || 0) + activity.points;
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: {
        studentId: req.params.id,
        totalPoints,
        pointsByType,
        activitiesCount: activities.length,
        activities: activities
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};