const express = require('express');
const router = express.Router();

const { StudentService } = require('./service');
const studentService = new StudentService();

router.post('/join_teacher', joinTeacherHandler);

async function joinTeacherHandler(req, res) {
  const token = req.headers['x-auth-token'];
  const student = await studentService.joinTeacher(token, req.body);
  res.json(student);
}

module.exports = router;
