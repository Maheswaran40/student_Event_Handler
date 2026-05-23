const EventScore = require('../models/EventScore');

// Add or update score for a student in an event
const addOrUpdateScore = async (req, res) => {
  try {
    const { eventId, studentId, score, status, addedBy } = req.body;

    // Validate required fields
    if (!eventId || !studentId) {
      return res.status(400).json({
        success: false,
        message: 'eventId and studentId are required'
      });
    }

    // Check if score already exists
    const existingScore = await EventScore.findOne({ eventId, studentId });

    if (existingScore) {
      // Update existing score
      existingScore.score = score !== undefined ? score : existingScore.score;
      existingScore.status = status || existingScore.status;
      if (addedBy) existingScore.addedBy = addedBy;

      const updatedScore = await existingScore.save();
      
      return res.status(200).json({
        success: true,
        message: 'Score updated successfully',
        data: updatedScore
      });
    } else {
      // Create new score
      const newScore = new EventScore({
        eventId,
        studentId,
        score: score || 0,
        status: status || 'participated',
        addedBy: addedBy || null
      });

      const savedScore = await newScore.save();
      
      return res.status(201).json({
        success: true,
        message: 'Score added successfully',
        data: savedScore
      });
    }
  } catch (error) {
    console.error('Error in addOrUpdateScore:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Score entry already exists for this event and student'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while adding/updating score',
      error: error.message
    });
  }
};

// Get all scores for a specific event with populated student details
const getScoresByEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    if (!eventId) {
      return res.status(400).json({
        success: false,
        message: 'eventId is required'
      });
    }

    const scores = await EventScore.find({ eventId })
      .populate('studentId', 'name phoneNo department') // Adjust fields as per your Student model
      .populate('eventId', 'name date description') // Adjust fields as per your Event model
      .populate('addedBy', 'name email') // Adjust fields as per your User model
      .sort({ score: -1 }); // Sort by highest score first

    res.status(200).json({
      success: true,
      count: scores.length,
      data: scores
    });
  } catch (error) {
    console.error('Error in getScoresByEvent:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching event scores',
      error: error.message
    });
  }
};

// Get all scores for a specific student with populated event details
const getStudentScores = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: 'studentId is required'
      });
    }

    const scores = await EventScore.find({ studentId })
      .populate('eventId', 'name date description category') // Adjust fields as per your Event model
      .populate('addedBy', 'name email')
      .sort({ createdAt: -1 }); // Sort by most recent first

    res.status(200).json({
      success: true,
      count: scores.length,
      data: scores
    });
  } catch (error) {
    console.error('Error in getStudentScores:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching student scores',
      error: error.message
    });
  }
};



module.exports = {
  addOrUpdateScore,
  getScoresByEvent,
  getStudentScores
};