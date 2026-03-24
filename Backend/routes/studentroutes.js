const express = require('express');
const router = express.Router();
const studentController = require('../controller/studentController');

// Student routes
router.post('/', studentController.createStudent);
router.get('/', studentController.getAllStudents);
router.get('/department/:department', studentController.getStudentsByDepartment);
router.get('/year/:year', studentController.getStudentsByYear);
router.get('/:id', studentController.getStudentById);
router.get('/:id/points-summary', studentController.getStudentPointsSummary);
router.put('/:id', studentController.updateStudent);
router.delete('/:id', studentController.deleteStudent);

module.exports = router;