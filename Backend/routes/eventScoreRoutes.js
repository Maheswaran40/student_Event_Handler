const express = require('express');
const router = express.Router();
const {
  addOrUpdateScore,
  getScoresByEvent,
  getStudentScores
} = require('../controller/eventScoreController');

// Route to add or update score
router.post('/add-score', addOrUpdateScore);

// Route to get all scores for a specific event
router.get('/event/:eventId', getScoresByEvent);

// Route to get all scores for a specific student
router.get('/student/:studentId', getStudentScores);

module.exports = router;

// {
//   "eventId": "69f1ecf944eb7e5ee058a1ed",
//   "studentId": "69f2eb7efe8c2f3448a30522",
//   "score": 85,
//   "status": "pass",
//   "addedBy": "69f1f4beeccc5263c2c0b59b"
// }