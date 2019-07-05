const generalErrorHandler = require('../error');
const { studentTeacherCollection } = require('../studentTeacher.model');
const { teacherCollection } = require('../teacher/model');
const { groupCollection } = require('../../groups/model');

const { studentCollection } = require('./model');
const schema = require('./schema');
const middleware = require('./middleware');
const validator = require('./validator');
const errorHandler = require('./error');

class StudentService {
  static async register(body) {
    const { error } = schema.register(body);
    if (error) throw new generalErrorHandler.ValidationError(error.details[0].message);

    const student = new studentCollection({
      name: body.name,
      phone: body.phone,
      address: body.address,
      age: body.age
    });

    await student.save();
    return student;
  }

  async joinTeacher(token, body) {
    const studentId = middleware.authorize(token);

    const { error } = schema.joinTeacher(body);
    if (error) throw new generalErrorHandler.ValidationError(error.details[0].message);

    const student = await validator.validateStudentExistence(studentId);
    const studentTeacher = await validator.validateStudentTeacherExistence(body.code);
    const teacher = await teacherCollection.findById(studentTeacher.teacherId);

    validator.validateDublicateTeacher(student, teacher._id);

    const { _id: studentTeacherId, teacherId, groupId } = studentTeacher;

    student.teachers.number++;
    student.teachers.details.push({ _id: teacherId, name: teacher.name, groupId, studentTeacherId });

    studentTeacher.studentId = studentId;

    await student.save();
    await studentTeacher.save();
    return student.teachers.details;
  }

  async viewJoinedTeachers(token) {
    const studentId = middleware.authorize(token);
    const student = await validator.validateStudentExistence(studentId);

    return student.teachers.details;
  }

  async viewTeacherDetails(token, teacherId) {
    const studentId = middleware.authorize(token);

    const studentTeacher = await studentTeacherCollection.findOne({ studentId, teacherId });
    return studentTeacher;
  }

  async recordAttendance(token, attendanceId, groupId) {
    const studentId = middleware.authorize(token);
    const group = await groupCollection.findById(groupId);

    let student = await studentTeacherCollection.findOne({ studentId, groupId });
    let studentInGroup = true;
    if (!student) {
      studentInGroup = false;
      student = await studentTeacherCollection.findOne({ studentId });
    }

    const attendanceDate = new Date(Date.now()).toLocaleString();

    if (group.attendance_record.details[0]._id === attendanceId) {
      if (!studentInGroup) {
        student.attendance.attendedFromAnotherGroup = true;
      } else if (student.attendance.hasRecordedAttendance) {
        throw new errorHandler.StudentHasRecordedAttendance();
      } else {
        student.absence.number--;
        student.absence.details.shift();
      }
    } else {
      throw new errorHandler.InvalidAttendanceId();
    }

    student.attendance.number++;
    student.attendance.details.unshift(attendanceDate);
    student.attendance.hasRecordedAttendance = true;

    await student.save();
    return student.attendance;
  }
}

exports.StudentService = StudentService;
