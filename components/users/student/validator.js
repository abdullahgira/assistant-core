const { teacherCollection } = require('../teacher/model');
const { studentTeacherCollection } = require('../studentTeacher.model');
const generalUserErrorHandler = require('../error');

const { studentCollection } = require('./model');
const errorHandler = require('./error');

exports.validateStudentExistence = async studentId => {
  const student = await studentCollection.findById(studentId);
  if (!student) throw new generalUserErrorHandler.InvalidToken();
  return student;
};

exports.validateStudentTeacherExistence = async studentTeacherId => {
  const studentTeacher = await studentTeacherCollection.findById(studentTeacherId);
  if (!studentTeacher) throw new generalUserErrorHandler.InvalidUserId();
  return studentTeacher;
};

exports.validateTeacherExistence = async teacherId => {
  const teacher = await teacherCollection.findById(teacherId);
  if (!teacher) throw new generalUserErrorHandler.InvalidUserId();
  return teacher;
};

exports.validateDublicateTeacher = (student, teacherId) => {
  const foundTeacher = student.teachers.details.find(t => t._id === teacherId);
  if (foundTeacher) throw new errorHandler.DoublicateEntry();
  return;
};

exports.validateStudentTeacherIsNotWithAnotherStudent = studentTeacher => {
  if (studentTeacher.studentId) throw new errorHandler.DoublicateEntry('Code is used by another student!');
  return;
};
