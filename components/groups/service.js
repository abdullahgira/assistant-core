const shortid = require('shortid');

const schema = require('./schema');
const errorHandler = require('./error');
const { groupCollection } = require('./model');

const { teacherCollection } = require('../users/teacher/model');
const { assistantCollection } = require('../users/assistant/model');
const { studentTeacherCollection } = require('../users/studentTeacher.model');
const assistantMiddleware = require('../users/assistant/middleware');
const generalUserErrorHandler = require('../users/error');

class GroupService {
  async createGroup(body, token) {
    const assistantId = assistantMiddleware.authorize(token);

    // finding the assistant with the assistantId
    const assistant = await assistantCollection.findById(assistantId);
    if (!assistant) throw new generalUserErrorHandler.InvalidToken();

    // validate body schema
    const { error } = schema.createGroup(body);
    if (error) throw new errorHandler.GroupCreationError(error.details[0].message);

    // accessing the teacher to check for double names
    const teacher = await teacherCollection.findById(assistant.teacherId);

    const isDuplicateName = teacher.groups.details.find(g => g.name === body.name.trim());
    if (isDuplicateName) throw new errorHandler.DoublicateEntry();

    const group = new groupCollection({
      name: body.name.trim(),
      teacherId: teacher._id
    });

    teacher.groups.number++;
    teacher.groups.details.push({ _id: group._id, name: body.name });

    await group.save();
    await teacher.save();

    return group;
  }

  async addStudent(body, token, groupId) {
    const assistantId = assistantMiddleware.authorize(token);

    // finding the assistant with the assistantId
    const assistant = await assistantCollection.findById(assistantId);
    if (!assistant) throw new generalUserErrorHandler.InvalidToken();

    // accessing teacher db
    const teacher = await teacherCollection.findById(assistant.teacherId);

    // accessing group db
    const group = await groupCollection.findById(groupId);
    if (!group) throw new errorHandler.InvalidGroupId();

    // validate body schema
    const { error } = schema.addStudent(body);
    if (error) throw new errorHandler.GroupCreationError(error.details[0].message);

    const code = shortid.generate();
    const studentTeacher = new studentTeacherCollection({
      _id: code,
      techerId: teacher._id,
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

    // finding the assistant with the assistantId
    const assistant = await assistantCollection.findById(assistantId);
    if (!assistant) throw new generalUserErrorHandler.InvalidToken();

    // accessing teacher db
    const teacher = await teacherCollection.findById(assistant.teacher);

    // accessing group db
    const group = await groupCollection.findById(groupId);
    if (!group) throw new errorHandler.InvalidGroupId();

    const studentTeacher = await studentTeacherCollection.findById(studentId);
    if (!studentTeacher) throw new generalUserErrorHandler.InvalidUserId();

    teacher.students.number--;
    teacher.students.details = teacher.students.details.filter(s => s._id !== studentId);

    group.students.number--;
    group.students.details = group.students.details.filter(s => s._id !== studentId);

    await studentTeacherCollection.deleteOne({ _id: studentId });
    await group.save();
    await teacher.save();
    return { status: 200 }; // success message
  }

  async setNewAttendanceCheck(token, groupId) {
    const assistantId = assistantMiddleware.authorize(token);
    const group = await groupCollection.findById(groupId);

    if (!group) throw new errorHandler.InvalidGroupId();

    const assistant = await assistantCollection.findById(assistantId);

    if (assistant.teacherId !== group.teacherId) throw new errorHandler.Forbidden();

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
    const assistantId = assistantMiddleware.authorize(token);
    const group = await groupCollection.findById(groupId);

    if (!group) throw new errorHandler.InvalidGroupId();

    const assistant = await assistantCollection.findById(assistantId);

    if (assistant.teacherId !== group.teacherId) throw new errorHandler.Forbidden();

    const student = await studentTeacherCollection.findById(studentId);
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
    return { message: 'Success' };
  }
}

exports.GroupService = GroupService;
