const express = require('express');
const router = express.Router();
const eventController = require('../controller/eventcontroller');
const upload = require('../middleware/multer');
// Event routes
// router.post('/', eventController.createEvent);
router.post('/', upload.single("image"), eventController.createEvent);
router.get('/', eventController.getAllEvents);
router.get('/upcoming', eventController.getUpcomingEvents);
router.get('/status/:status', eventController.getEventsByStatus);
router.get('/:id', eventController.getEventById);
router.get('/:id/participants', eventController.getEventParticipants);
router.put('/:id', eventController.updateEvent);
router.delete('/:id', eventController.deleteEvent);

module.exports = router;