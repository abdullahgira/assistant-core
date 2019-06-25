const express = require('express');
const router = express.Router();

const { GroupService } = require('./service');
const groupService = new GroupService();

router.get('/', showAllGroupsHandler);
router.get('/students', searchStudentsHandler);

router.post('/create_group', createGroupHandler);

router.post('/group_:id/add_student', addStudentHandler);
router.delete('/group_:groupId/students/student_:studentId', removeStudentHandler);

router.get('/group_:groupId/set_new_attendance_record', setNewAttendanceRecordHandler);
router.get('/group_:groupId/record_attendance/student_:studentId', recordAttendanceHandler);
router.get('/group_:groupId/show_recent_attendance_details', showRecentAttendanceDetailsHandler);

router.post('/set_attendance_payment', setAttendancePaymentHandler); // handles month and lesson using the type query
router.post('/set_books_payment', setBooksPaymentHandler);

router.post('/set_number_of_attendances_per_month', setNAttendancesPerMonthHanlder);

router.get('/take_books_payment', takeBooksPaymentHandler);
router.get('/reverse_take_books_payment', reverseTakeBooksPaymentHandler);

router.get('/group_:groupId/pay_attendance/student_:studentId', payAttendanceHandler); // uses url query to determine lesson or month payment
router.get('/group_:groupId/reverse_pay_attendance/student_:studentId', reversePayAttendanceHandler);

router.get('/group_:groupId/pay_books/student_:studentId', payBooksHandler);
router.get('/group_:groupId/reverse_pay_books/student_:studentId', reversePayBooksHandler);

router.get('/student_:studentId', getStudentDetailsHandler);

router.get('/settings', groupsSettingsHnadler);

async function showAllGroupsHandler(req, res) {
  const token = req.headers['x-auth-token'];
  const groups = await groupService.showAllGroups(token, req.query.day);
  res.json(groups);
}

async function searchStudentsHandler(req, res) {
  const token = req.headers['x-auth-token'];
  const students = await groupService.searchStudents(token, req.query.search, req.query.from, req.query.to);
  res.json(students);
}

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
  const student = await groupService.payAttendance(
    token,
    req.params.groupId,
    req.params.studentId,
    req.query.type
  );
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
  const status = await groupService.setAttendancePaymentAmount(token, req.body, req.query.type);
  res.json(status);
}

async function setBooksPaymentHandler(req, res) {
  const token = req.headers['x-auth-token'];
  const status = await groupService.setBooksPayment(token, req.body);
  res.json(status);
}

async function takeBooksPaymentHandler(req, res) {
  const token = req.headers['x-auth-token'];
  const status = await groupService.takeBooksPayment(token);
  res.json(status);
}

async function reverseTakeBooksPaymentHandler(req, res) {
  const token = req.headers['x-auth-token'];
  const status = await groupService.reverseTakeBooksPayment(token);
  res.json(status);
}

async function showRecentAttendanceDetailsHandler(req, res) {
  const token = req.headers['x-auth-token'];
  const details = await groupService.showRecentAttendanceDetails(token, req.params.groupId);
  res.json(details);
}

async function setNAttendancesPerMonthHanlder(req, res) {
  const token = req.headers['x-auth-token'];
  const status = await groupService.setNAttendancesPerMonth(token, req.body);
  res.json(status);
}

async function groupsSettingsHnadler(req, res) {
  const token = req.headers['x-auth-token'];
  const settings = await groupService.groupsSettings(token);
  res.json(settings);
}

module.exports = router;
