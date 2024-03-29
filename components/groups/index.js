const express = require('express');
const router = express.Router();

const { GroupService } = require('./service');
const groupService = new GroupService();

router.post('/start_week', setStartWeekHandler);

router.get('/', showAllGroupsHandler);
router.post('/create_group', createGroupHandler);
router.delete('/group_:groupId', deleteGroupHandler);

// student
router.post('/group_:id/add_student', addStudentHandler);
router.post('/student_:studentId', editStudentHandler);
router.delete('/group_:groupId/students/student_:studentId', removeStudentHandler);

router.get('/students', searchStudentsHandler);
router.get('/group_:groupId/students', showGroupStudentsHandler);

// attendance
router.get('/group_:groupId/set_new_attendance_record', setNewAttendanceRecordHandler);
router.get('/group_:groupId/record_attendance/student_:studentId', recordAttendanceHandler);
router.get('/group_:groupId/show_recent_attendance_details', showRecentAttendanceDetailsHandler);
router.get('/group_:groupId/absent_students', showAbsentStudentsHandler);
router.get('/group_:groupId/reverse_last_attendance_record', reverseLastAttendanceRecordHandler);
router.get('/group_:groupId/last_attendance_analytics', getLastAttendanceAnalyticsHandler);

// setting payment amount for books and attendance, and number of attendances per month
router.post('/set_attendance_payment', setAttendancePaymentHandler); // handles month and lesson using the type query
router.post('/set_books_payment', setBooksPaymentHandler);
router.post('/set_number_of_attendances_per_month', setNAttendancesPerMonthHanlder);

// books payment
router.get('/take_books_payment', takeBooksPaymentHandler);
router.get('/reverse_take_books_payment', reverseTakeBooksPaymentHandler);

// attendance payment
router.get('/pay_attendance/student_:studentId', payAttendanceHandler); // uses url query to determine lesson or month payment
router.get('/reverse_pay_attendance/student_:studentId', reversePayAttendanceHandler);

// studnet books payment
router.get('/pay_books/student_:studentId', payBooksHandler);
router.get('/reverse_pay_books/student_:studentId', reversePayBooksHandler);

router.get('/group_:groupId/total_payments', showTodayGroupPaymentHandler);
router.get('/group_:groupId/unpaid_students', getStudentsWhoHasNotPaidHandler);

// student details
router.get('/student_:studentId', getStudentDetailsHandler);
router.post('/custom_payment/student_:studentId', setCustomPaymentHandler);

// group settings
router.get('/settings', groupsSettingsHnadler);
router.get('/take_money_on_absence', setTakeMoneyOnAbsenceHandler);

// switch groups
router.get('/change_group/group_:fromGroupId/group_:toGroupId/student_:studentId', changeGroupHandler);

async function setStartWeekHandler(req, res) {
  const token = req.headers['x-auth-token'];
  const status = await groupService.setWeekStart(token, req.body);
  res.json(status);
}

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

async function deleteGroupHandler(req, res) {
  const token = req.headers['x-auth-token'];
  const status = await groupService.deleteGroup(token, req.params.groupId);
  res.json(status);
}

// student
async function addStudentHandler(req, res) {
  const token = req.headers['x-auth-token'];
  const code = await groupService.addStudent(req.body, token, req.params.id);
  res.json(code);
}

async function editStudentHandler(req, res) {
  const token = req.headers['x-auth-token'];
  const student = await groupService.editStudent(token, req.body, req.params.studentId);
  res.json(student);
}

async function removeStudentHandler(req, res) {
  const token = req.headers['x-auth-token'];
  const statusCode = await groupService.removeStudent(token, req.params.groupId, req.params.studentId);
  res.json(statusCode);
}

async function showGroupStudentsHandler(req, res) {
  const token = req.headers['x-auth-token'];
  const students = await groupService.showGroupStudents(token, req.params.groupId);
  res.json(students);
}

async function setNewAttendanceRecordHandler(req, res) {
  const token = req.headers['x-auth-token'];
  const message = await groupService.setNewAttendanceRecord(token, req.params.groupId, req.query.date);
  res.json(message);
}

async function reverseLastAttendanceRecordHandler(req, res) {
  const token = req.headers['x-auth-token'];
  const status = await groupService.reverseLastAttendanceRecord(token, req.params.groupId);
  res.json(status);
}

async function getLastAttendanceAnalyticsHandler(req, res) {
  const token = req.headers['x-auth-token'];
  const status = await groupService.getLastAttendanceAnalytics(token, req.params.groupId);
  res.json(status);
}


async function recordAttendanceHandler(req, res) {
  const token = req.headers['x-auth-token'];
  const student = await groupService.recordAttendance(
    token,
    req.params.groupId,
    req.params.studentId,
    req.query.date
  );
  res.json(student);
}

async function payAttendanceHandler(req, res) {
  const token = req.headers['x-auth-token'];
  const student = await groupService.payAttendance(
    token,
    req.params.studentId,
    req.query.type,
    req.query.customValue
  );
  res.json(student);
}

async function reversePayAttendanceHandler(req, res) {
  const token = req.headers['x-auth-token'];
  const student = await groupService.reversePayAttendance(token, req.params.studentId);
  res.json(student);
}

async function payBooksHandler(req, res) {
  const token = req.headers['x-auth-token'];
  const student = await groupService.payBooks(token, req.params.studentId, req.query.customValue);
  res.json(student);
}

async function reversePayBooksHandler(req, res) {
  const token = req.headers['x-auth-token'];
  const student = await groupService.reversePayBooks(token, req.params.studentId);
  res.json(student);
}

async function showTodayGroupPaymentHandler(req, res) {
  const token = req.headers['x-auth-token'];
  const groupPayment = await groupService.showTodayGroupPayment(token, req.params.groupId);
  res.json(groupPayment);
}

async function getStudentsWhoHasNotPaidHandler(req, res) {
  const token = req.headers['x-auth-token'];
  const students = await groupService.getStudentsWhoHasNotPaid(token, req.params.groupId);
  res.json(students);
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

async function showAbsentStudentsHandler(req, res) {
  const token = req.headers['x-auth-token'];
  const students = await groupService.showAbsentStudents(token, req.params.groupId);
  res.json(students);
}

async function changeGroupHandler(req, res) {
  const token = req.headers['x-auth-token'];
  const student = await groupService.changeGroup(
    token,
    req.params.fromGroupId,
    req.params.toGroupId,
    req.params.studentId
  );
  res.json(student);
}

async function setCustomPaymentHandler(req, res) {
  const token = req.headers['x-auth-token'];
  const student = await groupService.setCustomPayment(token, req.body, req.query.type, req.params.studentId);
  res.json(student);
}

async function setTakeMoneyOnAbsenceHandler(req, res) {
  const token = req.headers['x-auth-token'];
  const status = await groupService.setTakeMoneyOnAbsence(token, req.query.value);
  res.json(status);
}

module.exports = router;
