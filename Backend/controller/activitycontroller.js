// controller/taskActivityController.js
const TaskActivity = require('../models/activity');
const Student = require('../models/studentRegister');
const Event = require('../models/events');

// Get all activities (admin sees all, volunteer sees only assigned)
exports.getAllActivities = async (req, res) => {
  try {
    let query = {};
    
    // If user is not admin, only show their assigned activities
    if (req.user && req.user.role !== 'admin') {
      query.assignedTo = req.user.id;
    }
    
    const activities = await TaskActivity.find(query)
      .populate('eventId', 'title date venue')
      .populate('assignedTo', 'name rollNo email')
      .populate('assignedBy', 'name email')
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

// Get single activity by ID
exports.getActivityById = async (req, res) => {
  try {
    const activity = await TaskActivity.findById(req.params.id)
      .populate('eventId', 'title description date venue incharge')
      .populate('assignedTo', 'name rollNo email phoneNo')
      .populate('assignedBy', 'name email');
    
    if (!activity) {
      return res.status(404).json({
        success: false,
        error: 'Activity not found'
      });
    }
    
    // Check permission (volunteer can only view their own activities)
    if (req.user && req.user.role !== 'admin' && activity.assignedTo._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. You can only view your assigned activities.'
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

// Create new activity (Admin only)
exports.createActivity = async (req, res) => {
  try {
    const { title, description, eventId, assignedTo, priority, deadline, points } = req.body;
    
    // Check if admin (assuming admin check middleware is applied)
    const adminId = req.user.id;
    
    // Validate event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }
    
    // Validate volunteer exists
    const volunteer = await Student.findById(assignedTo);
    if (!volunteer) {
      return res.status(404).json({
        success: false,
        error: 'Volunteer not found'
      });
    }
    
    const activity = new TaskActivity({
      title,
      description,
      eventId,
      assignedTo,
      assignedBy: adminId,
      priority: priority || 'Medium',
      deadline,
      points: points || 0,
      status: 'pending'
    });
    
    await activity.save();
    
    const populatedActivity = await TaskActivity.findById(activity._id)
      .populate('eventId', 'title date venue')
      .populate('assignedTo', 'name rollNo')
      .populate('assignedBy', 'name');
    
    res.status(201).json({
      success: true,
      message: 'Activity created and assigned successfully',
      data: populatedActivity
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Update activity (Admin: full update, Volunteer: status only)
exports.updateActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    const activity = await TaskActivity.findById(id);
    if (!activity) {
      return res.status(404).json({
        success: false,
        error: 'Activity not found'
      });
    }
    
    // Permission checks
    if (userRole !== 'admin') {
      // Volunteer can only update status to 'completed' and add proof
      if (updates.status && updates.status !== 'completed') {
        return res.status(403).json({
          success: false,
          error: 'Volunteers can only mark activities as completed'
        });
      }
      if (updates.assignedTo || updates.points || updates.priority) {
        return res.status(403).json({
          success: false,
          error: 'Volunteers cannot reassign, change points, or modify priority'
        });
      }
      if (activity.assignedTo.toString() !== userId) {
        return res.status(403).json({
          success: false,
          error: 'You can only update activities assigned to you'
        });
      }
    }
    
    // Apply updates
    Object.keys(updates).forEach(key => {
      if (key !== '_id' && key !== '__v') {
        activity[key] = updates[key];
      }
    });
    
    // Set timestamps based on status
    if (updates.status === 'completed' && !activity.completedAt) {
      activity.completedAt = new Date();
    }
    if (updates.status === 'approved' && !activity.approvedAt) {
      activity.approvedAt = new Date();
    }
    
    await activity.save();
    
    const updatedActivity = await TaskActivity.findById(id)
      .populate('eventId', 'title date venue')
      .populate('assignedTo', 'name rollNo')
      .populate('assignedBy', 'name');
    
    res.status(200).json({
      success: true,
      message: 'Activity updated successfully',
      data: updatedActivity
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Delete activity (Admin only)
exports.deleteActivity = async (req, res) => {
  try {
    const activity = await TaskActivity.findByIdAndDelete(req.params.id);
    
    if (!activity) {
      return res.status(404).json({
        success: false,
        error: 'Activity not found'
      });
    }
    
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
    const { status } = req.params;
    let query = { status };
    
    // If not admin, only show assigned activities
    if (req.user && req.user.role !== 'admin') {
      query.assignedTo = req.user.id;
    }
    
    const activities = await TaskActivity.find(query)
      .populate('eventId', 'title date')
      .populate('assignedTo', 'name rollNo')
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
    const { eventId } = req.params;
    let query = { eventId };
    
    // If not admin, only show assigned activities
    if (req.user && req.user.role !== 'admin') {
      query.assignedTo = req.user.id;
    }
    
    const activities = await TaskActivity.find(query)
      .populate('assignedTo', 'name rollNo')
      .sort({ priority: -1, deadline: 1 });
    
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

// Get activities by assigned volunteer
exports.getActivitiesByVolunteer = async (req, res) => {
  try {
    const { volunteerId } = req.params;
    
    // Check permission
    if (req.user && req.user.role !== 'admin' && req.user.id !== volunteerId) {
      return res.status(403).json({
        success: false,
        error: 'You can only view your own activities'
      });
    }
    
    const activities = await TaskActivity.find({ assignedTo: volunteerId })
      .populate('eventId', 'title date venue')
      .sort({ status: 1, deadline: 1 });
    
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

// Get activity statistics
exports.getStatistics = async (req, res) => {
  try {
    let matchQuery = {};
    
    // If not admin, only show assigned activities stats
    if (req.user && req.user.role !== 'admin') {
      matchQuery.assignedTo = req.user.id;
    }
    
    const stats = await TaskActivity.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          approved: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } },
          cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
          totalPoints: { $sum: '$points' }
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      data: stats[0] || { total: 0, pending: 0, completed: 0, approved: 0, cancelled: 0, totalPoints: 0 }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Mark activity as completed with proof (Volunteer)
exports.markAsCompleted = async (req, res) => {
  try {
    const { id } = req.params;
    const { proof } = req.body;
    const userId = req.user.id;
    
    const activity = await TaskActivity.findById(id);
    if (!activity) {
      return res.status(404).json({
        success: false,
        error: 'Activity not found'
      });
    }
    
    // Check if assigned to this volunteer
    if (activity.assignedTo.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: 'You can only complete activities assigned to you'
      });
    }
    
    // Check if already completed or approved
    if (activity.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: `Activity is already ${activity.status}. Cannot mark as completed.`
      });
    }
    
    activity.status = 'completed';
    activity.proof = proof;
    activity.completedAt = new Date();
    
    await activity.save();
    
    res.status(200).json({
      success: true,
      message: 'Activity marked as completed. Waiting for admin approval.',
      data: activity
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Approve activity (Admin)
exports.approveActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;
    
    const activity = await TaskActivity.findById(id);
    if (!activity) {
      return res.status(404).json({
        success: false,
        error: 'Activity not found'
      });
    }
    
    if (activity.status !== 'completed') {
      return res.status(400).json({
        success: false,
        error: 'Only completed activities can be approved'
      });
    }
    
    activity.status = 'approved';
    activity.approvedAt = new Date();
    if (remarks) activity.remarks = remarks;
    
    await activity.save();
    
    // Add points to volunteer's total (if you have a points system)
    // This can be implemented in your Student model
    
    res.status(200).json({
      success: true,
      message: 'Activity approved successfully',
      data: activity
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Reject activity (Admin)
exports.rejectActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;
    
    const activity = await TaskActivity.findById(id);
    if (!activity) {
      return res.status(404).json({
        success: false,
        error: 'Activity not found'
      });
    }
    
    if (activity.status !== 'completed') {
      return res.status(400).json({
        success: false,
        error: 'Only completed activities can be rejected'
      });
    }
    
    activity.status = 'cancelled';
    activity.remarks = remarks || 'Activity rejected by admin';
    
    await activity.save();
    
    res.status(200).json({
      success: true,
      message: 'Activity rejected',
      data: activity
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Update points only (Admin)
exports.updatePoints = async (req, res) => {
  try {
    const { id } = req.params;
    const { points } = req.body;
    
    if (points === undefined || points < 0) {
      return res.status(400).json({
        success: false,
        error: 'Valid points are required'
      });
    }
    
    const activity = await TaskActivity.findByIdAndUpdate(
      id,
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

// Reassign activity to another volunteer (Admin)
exports.reassignActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedTo } = req.body;
    
    // Validate new volunteer exists
    const volunteer = await Student.findById(assignedTo);
    if (!volunteer) {
      return res.status(404).json({
        success: false,
        error: 'Volunteer not found'
      });
    }
    
    const activity = await TaskActivity.findByIdAndUpdate(
      id,
      { 
        assignedTo,
        status: 'pending', // Reset status when reassigned
        remarks: `Reassigned to ${volunteer.name}`
      },
      { new: true }
    );
    
    if (!activity) {
      return res.status(404).json({
        success: false,
        error: 'Activity not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Activity reassigned successfully',
      data: activity
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

