const express = require('express');
const router = express.Router();
const studentController = require('../controller/studentController');
const { protect } = require('../middleware/authmiddle');

// Student routes
router.post('/', studentController.createStudent);
router.get('/', studentController.getAllStudents);
router.get('/department/:department', studentController.getStudentsByDepartment);
router.get('/year/:year', studentController.getStudentsByYear);
router.get('/:id', studentController.getStudentById);
router.get('/:id/points-summary', studentController.getStudentPointsSummary);
router.put('/:id', studentController.updateStudent);
router.delete('/:id', studentController.deleteStudent);
router.get("/event/:id/students", protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("registeredStudents", "name email"); // 🔥 only needed fields

    res.json({
      success: true,
      data: event.registeredStudents
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;