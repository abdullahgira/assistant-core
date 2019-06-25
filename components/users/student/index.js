const express = require('express');
const router = express.Router();

const { StudentService } = require('./service');
const studentService = new StudentService();

router.post('/join_teacher', joinTeacherHandler);
router.get('/teachers', viewJoinedTeachersHandler);

router.get('/teachers/teacher_:teacherId', viewTeacherDetailsHandler);

async function joinTeacherHandler(req, res) {
  const token = req.headers['x-auth-token'];
  const student = await studentService.joinTeacher(token, req.body);
  res.json(student);
}

async function viewJoinedTeachersHandler(req, res) {
  const token = req.headers['x-auth-token'];
  const teachers = await studentService.viewJoinedTeachers(token);
  res.json(teachers);
}

async function viewTeacherDetailsHandler(req, res) {
  const token = req.headers['x-auth-token'];
  const studentTeacherDetails = await studentService.viewTeacherDetails(token, req.params.teacherId);
  res.json(studentTeacherDetails);
}

module.exports = router;
