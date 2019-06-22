const shortid = require('shortid');

const schema = require('./schema');
const errorHandler = require('./error');
const validator = require('./validator');
const { groupCollection } = require('./model');

const { teacherCollection } = require('../users/teacher/model');
const { studentTeacherCollection } = require('../users/studentTeacher.model');
const assistantMiddleware = require('../users/assistant/middleware');

class GroupService {
  async createGroup(body, token) {
    const assistantId = assistantMiddleware.authorize(token);
    const assistant = await validator.validateAssistantExistence(assistantId);

    // validate body schema
    const { error } = schema.createGroup(body);
    if (error) throw new errorHandler.GroupCreationError(error.details[0].message);

    // accessing the teacher to check for double names
    const teacher = await teacherCollection.findById(assistant.teacherId);

    const isDuplicateName = teacher.groups.details.find(
      g => g.name === body.name.trim() && g.day === body.day
    );
    if (isDuplicateName) throw new errorHandler.DoublicateEntry();

    const group = new groupCollection({
      name: body.name.trim(),
      day: body.day,
      teacherId: teacher._id
    });

    teacher.groups.number++;
    teacher.groups.details.push({ _id: group._id, name: group.name, day: group.day });

    await group.save();
    await teacher.save();

    return group;
  }

  async showAllGroups(token, day) {
    const assistantId = assistantMiddleware.authorize(token);
    const assistant = await validator.validateAssistantExistence(assistantId);

    const validDays = ['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri'];
    const validGivenDay = validDays.filter(d => d === day)[0];

    if (validGivenDay) {
      return await groupCollection.find({ teacherId: assistant.teacherId, day: day });
    } else {
      return await groupCollection.find({ teacherId: assistant.teacherId });
    }
  }

  async addStudent(body, token, groupId) {
    const assistantId = assistantMiddleware.authorize(token);
    const assistant = await validator.validateAssistantExistence(assistantId);
    const group = await validator.validateGroupExistence(groupId);

    validator.validateGroupCanBeModifiedByAssistant(group, assistant);

    const teacher = await teacherCollection.findById(assistant.teacherId);

    // validate body schema
    const { error } = schema.addStudent(body);
    if (error) throw new errorHandler.GroupCreationError(error.details[0].message);

    const code = shortid.generate();
    const studentTeacher = new studentTeacherCollection({
      _id: code,
      teacherId: teacher._id,
      groupId: groupId,
      name: body.name,
      phone: body.phone
    });

    // adding the new student to the teacher db
    teacher.students.number++;
    teacher.students.details.push({ _id: code, name: body.name });

    // adding the new student to the group db
    group.students.number++;
    group.students.details.push({ _id: code, name: body.name });

    await group.save();
    await teacher.save();
    await studentTeacher.save();

    return { code };
  }

  async removeStudent(body, token, groupId, studentId) {
    // TODO: Access student db when implemented and remove that teacher
    const assistantId = assistantMiddleware.authorize(token);
    const assistant = await validator.validateAssistantExistence(assistantId);
    const group = await validator.validateGroupExistence(groupId);

    validator.validateGroupCanBeModifiedByAssistant(group, assistant);
    await validator.validateStudentExistence(studentId);

    const teacher = await teacherCollection.findById(assistant.teacherId);
    teacher.students.number--;
    teacher.students.details = teacher.students.details.filter(s => s._id !== studentId);

    group.students.number--;
    group.students.details = group.students.details.filter(s => s._id !== studentId);

    await studentTeacherCollection.deleteOne({ _id: studentId });
    await group.save();
    await teacher.save();
    return { status: 200 }; // success message
  }

  async setNewAttendanceRecord(token, groupId) {
    /**
     * @param token -> json web token
     * @param groupId -> the group id that will have a new attendance record
     *
     * New attendance records are saved to the Group table with a unique id, teacher id
     * and the current date.
     *
     * New attendace is recorded for each student by incrementing his absence, adding the current
     * date to his absence details and resetting hasRecordedAttendance property,
     * if the student came from anoter group, we only set attendedFromAnotherGroup to false
     * and do nothing else.
     *
     */
    const assistantId = assistantMiddleware.authorize(token);
    const assistant = await validator.validateAssistantExistence(assistantId);
    const group = await validator.validateGroupExistence(groupId);

    validator.validateGroupCanBeModifiedByAssistant(group, assistant);

    const students = await studentTeacherCollection.find({ groupId: groupId });
    const nowDate = new Date(Date.now()).toLocaleString();
    const attendanceId = shortid.generate();

    group.attendance_record.number++;
    group.attendance_record.details.unshift({
      _id: attendanceId,
      teacherId: assistant.teacherId,
      date: nowDate
    });

    students.forEach(async s => {
      if (s.attendance.attendedFromAnotherGroup) {
        s.attendance.attendedFromAnotherGroup = false;
      } else {
        s.absence.number++;
        s.absence.details.unshift(nowDate);
        s.attendance.hasRecordedAttendance = false;
      }
      await s.save();
    });

    await group.save();
    return { _id: attendanceId, date: nowDate };
  }

  async recordAttendance(token, groupId, studentId) {
    /**
     * @param token -> json web token
     * @param groupId -> the group id at wich the attendance will be recorded
     * @param studentId -> the id of the student that will record attendance
     *
     * It checks if the student is from the same group, if the student is from another group,
     * it sets attendedFromAnotherGroup to true, and doesn't delete the latest recorded absence,
     * because his absence was not recorded with this group.
     *
     * If the student is from the same group, the latest absence is removed.
     *
     * For both students, a new attendance record is added to them and a hasRecordedAttendance
     * property is set to true to prevent more than one attendance record for the same student,
     * this property is reset when a new attendance record is requested.
     *
     */
    const assistantId = assistantMiddleware.authorize(token);
    const assistant = await validator.validateAssistantExistence(assistantId);

    const group = await validator.validateGroupExistence(groupId);
    validator.validateGroupCanBeModifiedByAssistant(group, assistant);

    const student = await validator.validateStudentExistence(studentId);
    validator.validateStudentCanBeModifiedByAssistant(student, assistant);

    const attendanceDate = group.attendance_record.details[0].date;

    if (student.groupId !== groupId) {
      student.attendance.attendedFromAnotherGroup = true;
    } else if (student.attendance.hasRecordedAttendance) {
      throw new errorHandler.StudentHasRecordedAttendance();
    } else {
      student.absence.number--;
      student.absence.details.shift();
    }

    student.attendance.number++;
    student.attendance.details.unshift(attendanceDate);
    student.attendance.hasRecordedAttendance = true;

    await student.save();
    return { student };
  }

  async payAttendance(token, groupId, studentId) {
    /**
     * @param token -> json web token
     * @param groupId -> the group id at wich the attendance will be recorded
     * @param studentId -> the id of the student that will record attendance
     *
     * Increments attendancePyament number for student and add the current date
     * to the details of the payment, this method can be called as many times as needed
     * and should be reversed by reversePayAttendance.
     *
     */
    const assistantId = assistantMiddleware.authorize(token);
    const assistant = await validator.validateAssistantExistence(assistantId);

    const group = await validator.validateGroupExistence(groupId);
    validator.validateGroupCanBeModifiedByAssistant(group, assistant);

    const student = await validator.validateStudentExistence(studentId);
    validator.validateStudentCanBeModifiedByAssistant(student, assistant);

    student.attendancePayment.number++;
    student.attendancePayment.details.unshift(group.attendance_record.details[0].date);

    await student.save();
    return { student };
  }

  async reversePayAttendance(token, groupId, studentId) {
    /**
     * @param token -> json web token
     * @param groupId -> the group id at wich the attendance will be recorded
     * @param studentId -> the id of the student that will record attendance
     *
     * Decrement attendancePyament number for student and remove the last
     * payment details, this method will throw an error if it is fired and there is 0
     * attendancePayment.
     *
     */
    const assistantId = assistantMiddleware.authorize(token);
    const assistant = await validator.validateAssistantExistence(assistantId);

    const group = await validator.validateGroupExistence(groupId);
    validator.validateGroupCanBeModifiedByAssistant(group, assistant);

    const student = await validator.validateStudentExistence(studentId);
    validator.validateStudentCanBeModifiedByAssistant(student, assistant);

    if (student.attendancePayment.number === 0) throw new errorHandler.ReachedMaxReversePayValue();

    student.attendancePayment.number--;
    student.attendancePayment.details.shift();

    await student.save();
    return { student };
  }

  async payBooks(token, groupId, studentId) {
    const assistantId = assistantMiddleware.authorize(token);
    const assistant = await validator.validateAssistantExistence(assistantId);

    const group = await validator.validateGroupExistence(groupId);
    validator.validateGroupCanBeModifiedByAssistant(group, assistant);

    const student = await validator.validateStudentExistence(studentId);
    validator.validateStudentCanBeModifiedByAssistant(student, assistant);

    student.booksPayment.number++;
    student.booksPayment.details.unshift(new Date(Date.now()).toLocaleString());

    await student.save();
    return { student };
  }

  async reversePayBooks(token, groupId, studentId) {
    const assistantId = assistantMiddleware.authorize(token);
    const assistant = await validator.validateAssistantExistence(assistantId);

    const group = await validator.validateGroupExistence(groupId);
    validator.validateGroupCanBeModifiedByAssistant(group, assistant);

    const student = await validator.validateStudentExistence(studentId);
    validator.validateStudentCanBeModifiedByAssistant(student, assistant);

    if (student.booksPayment.number === 0) throw new errorHandler.ReachedMaxReversePayValue();

    student.booksPayment.number--;
    student.booksPayment.details.shift();

    await student.save();
    return { student };
  }

  async getStudentDetails(token, studentId) {
    const assistantId = assistantMiddleware.authorize(token);
    const assistant = await validator.validateAssistantExistence(assistantId);

    const student = await validator.validateStudentExistence(studentId);
    validator.validateStudentCanBeModifiedByAssistant(student, assistant);

    return { student };
  }
}

exports.GroupService = GroupService;
