// routes/taskActivityRoutes.js
const express = require('express');
const router = express.Router();
const taskActivityController = require('../controller/activitycontroller');
const { protect, adminOnly } = require('../middleware/authmiddle');

// All routes require authentication
router.use(protect);

// Admin-only routes
router.post('/', adminOnly, taskActivityController.createActivity);
router.delete('/:id', adminOnly, taskActivityController.deleteActivity);
router.patch('/:id/approve', adminOnly, taskActivityController.approveActivity);
router.patch('/:id/reject', adminOnly, taskActivityController.rejectActivity);
router.patch('/:id/points', adminOnly, taskActivityController.updatePoints);
router.patch('/:id/reassign', adminOnly, taskActivityController.reassignActivity);

// Routes accessible by both admin and volunteers (with role-based filtering)
router.get('/', taskActivityController.getAllActivities);
router.get('/statistics', taskActivityController.getStatistics);
router.get('/status/:status', taskActivityController.getActivitiesByStatus);
router.get('/event/:eventId', taskActivityController.getActivitiesByEvent);
router.get('/volunteer/:volunteerId', taskActivityController.getActivitiesByVolunteer);
router.get('/:id', taskActivityController.getActivityById);

// Volunteer action
router.patch('/:id/complete', taskActivityController.markAsCompleted);

// Update activity (handles both admin and volunteer updates with permissions)
router.put('/:id', taskActivityController.updateActivity);

module.exports = router;