const express = require('express');
const router = express.Router();
const activityController = require('../controller/activitycontroller');

// Activity routes
router.post('/register', activityController.registerForEvent);
router.get('/', activityController.getAllActivities);
router.get('/student/:studentId', activityController.getActivitiesByStudent);
router.get('/event/:eventId', activityController.getActivitiesByEvent);
router.get('/status/:status', activityController.getActivitiesByStatus);
router.get('/student/:studentId/total-points', activityController.getStudentTotalPoints);
router.get('/:id', activityController.getActivityById);
router.patch('/:id/status', activityController.updateActivityStatus);
router.patch('/:id/points', activityController.updateActivityPoints);
router.delete('/:id', activityController.deleteActivity);

module.exports = router;