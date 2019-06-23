const express = require('express');
const router = express.Router();

const { GroupService } = require('./service');
const groupService = new GroupService();

router.post('/create_group', createGroupHandler);

router.post('/group_:id/add_student', addStudentHandler);
router.delete('/group_:groupId/students/student_:studentId', removeStudentHandler);

router.get('/group_:groupId/set_new_attendance_record', setNewAttendanceRecordHandler);
router.get('/group_:groupId/record_attendance/student_:studentId', recordAttendanceHandler);

router.post('/set_attendance_payment', setAttendancePaymentHandler);

router.post('/group_:groupId/pay_attendance/student_:studentId', payAttendanceHandler);
router.get('/group_:groupId/reverse_pay_attendance/student_:studentId', reversePayAttendanceHandler);

router.get('/group_:groupId/pay_books/student_:studentId', payBooksHandler);
router.get('/group_:groupId/reverse_pay_books/student_:studentId', reversePayBooksHandler);

router.get('/student_:studentId', getStudentDetailsHandler);

async function createGroupHandler(req, res) {
  const token = req.headers['x-auth-token'];
  const group = await groupService.createGroup(req.body, token);
  res.json(group);
}

async function addStudentHandler(req, res) {
  const token = req.headers['x-auth-token'];
  const code = await groupService.addStudent(req.body, token, req.params.id);
  res.json(code);
}

async function removeStudentHandler(req, res) {
  const token = req.headers['x-auth-token'];
  const statusCode = await groupService.removeStudent(
    req.body,
    token,
    req.params.groupId,
    req.params.studentId
  );
  res.json(statusCode);
}

async function setNewAttendanceRecordHandler(req, res) {
  const token = req.headers['x-auth-token'];
  const message = await groupService.setNewAttendanceRecord(token, req.params.groupId);
  res.json(message);
}

async function recordAttendanceHandler(req, res) {
  const token = req.headers['x-auth-token'];
  const student = await groupService.recordAttendance(token, req.params.groupId, req.params.studentId);
  res.json(student);
}

async function payAttendanceHandler(req, res) {
  const token = req.headers['x-auth-token'];
  const student = await groupService.payAttendance(token, req.params.groupId, req.params.studentId, req.body);
  res.json(student);
}

async function reversePayAttendanceHandler(req, res) {
  const token = req.headers['x-auth-token'];
  const student = await groupService.reversePayAttendance(token, req.params.groupId, req.params.studentId);
  res.json(student);
}

async function payBooksHandler(req, res) {
  const token = req.headers['x-auth-token'];
  const student = await groupService.payBooks(token, req.params.groupId, req.params.studentId);
  res.json(student);
}

async function reversePayBooksHandler(req, res) {
  const token = req.headers['x-auth-token'];
  const student = await groupService.reversePayBooks(token, req.params.groupId, req.params.studentId);
  res.json(student);
}

async function getStudentDetailsHandler(req, res) {
  const token = req.headers['x-auth-token'];
  const student = await groupService.getStudentDetails(token, req.params.studentId);
  res.json(student);
}

async function setAttendancePaymentHandler(req, res) {
  const token = req.headers['x-auth-token'];
  const status = await groupService.setAttendancePaymentAmount(token, req.body);
  res.json(status);
}

module.exports = router;
