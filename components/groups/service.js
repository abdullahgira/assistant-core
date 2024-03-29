const shortid = require('shortid');

const schema = require('./schema');
const errorHandler = require('./error');
const validator = require('./validator');
const { groupCollection } = require('./model');

const { teacherCollection } = require('../users/teacher/model');
const { studentCollection } = require('../users/student/model');
const { studentTeacherCollection } = require('../users/studentTeacher.model');
const assistantMiddleware = require('../users/assistant/middleware');

class GroupService {
  _leftRotate(arr, dist) {
    /**
     * @param arr -> array
     * @param dist -> number
     * @returns arr left rotated by a distance equal to dist
     */

    for (let i = 0; i < dist; i++) {
      let j;
      let temp = arr[0];
      for (j = 0; j < arr.length - 1; j++) {
        arr[j] = arr[j + 1];
      }
      arr[j] = temp;
    }
    return arr;
  }

  async setWeekStart(token, body) {
    const assistantId = assistantMiddleware.authorize(token);
    const assistant = await validator.validateAssistantExistence(assistantId);

    const { error } = schema.setWeekStart(body);
    if (error) throw new errorHandler.GroupCreationError(error.details[0].message);

    const defaultWeekDays = ['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri'];
    await teacherCollection.findByIdAndUpdate(assistant.teacherId, {
      weekStart: body.day,
      weekDays: this._leftRotate(defaultWeekDays, defaultWeekDays.findIndex(d => d === body.day))
    });
    return { status: 200 };
  }

  async createGroup(body, token) {
    /**
     * @param token -> assistant jwt
     * @param body -> new group name and day
     * @returns all the groups of the same day
     *
     * Creates a new group with the given day and make sure
     * there are no duplicate group names in the same day
     */

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

    return await groupCollection.find({ teacherId: group.teacherId, day: group.day });
  }

  async groupsSettings(token) {
    /**
     * @param token -> assistant jwt
     * @returns all group's payment information
     */

    const assistantId = assistantMiddleware.authorize(token);
    const assistant = await validator.validateAssistantExistence(assistantId);

    const {
      attendancePayment,
      monthlyPayment,
      nAttendancePerMonth,
      booksPayment,
      nBooksPayment,
      takeMoneyOnAbsence,
      weekStart
    } = await teacherCollection.findById(assistant.teacherId);
    return {
      attendancePayment,
      monthlyPayment,
      nAttendancePerMonth,
      booksPayment,
      nBooksPayment,
      takeMoneyOnAbsence,
      weekStart
    };
  }

  async showAllGroups(token, day) {
    /**
     * @param token -> assistant jwt
     * @param day -> groups day
     * @returns a list of all groups at the given day, if no day or
     * invalid day was given it returns []
     */

    const assistantId = assistantMiddleware.authorize(token);
    const assistant = await validator.validateAssistantExistence(assistantId);

    const validDays = { sat: 1, sun: 2, mon: 3, tue: 4, wed: 5, thu: 6, fri: 7 };
    const validGivenDay = validDays.hasOwnProperty(day);

    if (validGivenDay) {
      return await groupCollection.find({ teacherId: assistant.teacherId, day: day });
    } else {
      const groups = await groupCollection.find({ teacherId: assistant.teacherId });
      groups.sort((x, y) => validDays[x.day] - validDays[y.day]);
      return groups;
    }
  }

  async deleteGroup(token, groupId) {
    const assistantId = assistantMiddleware.authorize(token);
    const assistant = await validator.validateAssistantExistence(assistantId);
    const group = await validator.validateGroupExistence(groupId);

    validator.validateGroupCanBeModifiedByAssistant(group, assistant);

    const teacher = await teacherCollection.findById(assistant.teacherId);

    teacher.groups.number--;
    const newGroups = teacher.groups.details.filter(g => String(g._id) !== groupId);
    teacher.groups.details = newGroups;

    // deleting student teacher db and removing that teacher from each student
    group.students.details.forEach(async s => {
      await studentTeacherCollection.findByIdAndDelete(s._id);
    });

    const students = await studentCollection.find({ 'teachers.details.groupId': groupId });
    students.forEach(async s => {
      s.teachers.number--;
      s.teachers.details = s.teachers.details.filter(t => t._id !== teacher._id);
      await s.save();
    });

    // delete group from groupsCollection
    await groupCollection.findByIdAndDelete(groupId);
    await teacher.save();
    return { status: 200 };
  }

  async addStudent(body, token, groupId) {
    /**
     * @param token -> assistant jwt.
     * @param body -> new studen name, phone and address are expected.
     * @param groupId -> the group at which the student will be added.
     * @returns the teacherId and the code of the new student
     * @throws if invalid body properties were found, invalid token,
     * invalid groupId or a group that can't be modified by the assistant.
     */

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
      phone: body.phone,
      parentPhone: body.parentPhone,
      address: body.address,
      studentNumber: body.studentNumber
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

    return { code, teacherId: teacher._id };
  }

  async editStudent(token, body, studentId) {
    const assistantId = assistantMiddleware.authorize(token);
    const assistant = await validator.validateAssistantExistence(assistantId);

    // validating studentId and that he is with the same teacher as the assistant
    const student = await validator.validateStudentExistence(studentId);
    validator.validateStudentCanBeModifiedByAssistant(student, assistant);

    const { error } = schema.editStudent(body);
    if (error) throw new errorHandler.GroupCreationError(error.details[0].message);

    for (let property in body) {
      student[property] = body[property];
    }

    await student.save();
    return student;
  }

  async removeStudent(token, groupId, studentId) {
    /**
     * @param token -> assistant jwt
     * @param groupId -> the group in which the student will be removed
     * @param studentId -> the student that will be deleted
     * @returns {status: 200}
     */

    // TODO: Access student db when implemented and remove that teacher
    const assistantId = assistantMiddleware.authorize(token);
    const assistant = await validator.validateAssistantExistence(assistantId);

    const studentTeacher = await validator.validateStudentExistence(studentId);
    const group = await validator.validateGroupExistence(studentTeacher.groupId);

    await validator.validateGroupExistence(groupId);
    validator.validateGroupCanBeModifiedByAssistant(group, assistant);

    const teacher = await teacherCollection.findById(assistant.teacherId);
    teacher.students.number--;
    teacher.students.details = teacher.students.details.filter(s => s._id !== studentId);

    group.students.number--;
    group.students.details = group.students.details.filter(s => s._id !== studentId);

    const student = await studentCollection.findOne({ 'teachers.details.studentTeacherId': studentId });
    if (student) {
      student.teachers.number--;
      student.teachers.details = student.teachers.details.filter(t => t._id !== teacher._id);

      await student.save();
    }

    await studentTeacherCollection.findByIdAndDelete(studentId);
    await group.save();
    await teacher.save();
    return { status: 200 }; // success message
  }

  async searchStudents(token, search, from, to) {
    /**
     * @param token -> assistant json web token
     * @param from -> return students starting from student number {from}
     * @param to -> return students up to student number {to}
     * @returns an array of the found students
     *
     * Takes from, to or none of them, if from was given and to was not it will return
     * starting from student {from} up to student {from + 20}, if to was given and to was bigger
     * than students.length the remaining students only are gonna be returned, else it will return up
     * to student number {to}
     *
     * If any invaild value was passed, from will be reset to 0 and to will be reset to 20
     */

    const assistantId = assistantMiddleware.authorize(token);
    const assistant = await validator.validateAssistantExistence(assistantId);

    const allStudents = search
      ? await studentTeacherCollection.find({
          teacherId: assistant.teacherId,
          name: new RegExp(search, 'ig')
        })
      : await studentTeacherCollection.find({ teacherId: assistant.teacherId });
    const maxStudentsReturn = 20;

    let validTo = 0;
    let students = [];

    from = parseInt(from);
    to = parseInt(to);

    if (!from || from < 0) from = 0;
    if (!to || to < 0 || to < from) to = from + maxStudentsReturn;

    if (from < allStudents.length) {
      to - from <= maxStudentsReturn ? (validTo = to) : (validTo = from + maxStudentsReturn);
      to >= allStudents.length && (validTo = from + (allStudents.length - from));

      for (let i = from; i < validTo; i++) {
        students.push(allStudents[i]);
      }
    }

    return students;
  }

  async showGroupStudents(token, groupId) {
    const assistantId = assistantMiddleware.authorize(token);
    const assistant = await validator.validateAssistantExistence(assistantId);
    const group = await validator.validateGroupExistence(groupId);

    validator.validateGroupCanBeModifiedByAssistant(group, assistant);
    const students = await studentTeacherCollection.find({ groupId }); // .sort({ studentNumber: 1 });

    students.sort(
      (a, b) => parseInt(a.studentNumber.match(/\d+/g)[0]) - parseInt(b.studentNumber.match(/\d+/g)[0])
    );
    return students;
  }

  async setNewAttendanceRecord(token, groupId, date) {
    /**
     * @param token -> json web token
     * @param groupId -> the group id that will have a new attendance record
     *
     * New attendance records are saved to the Group table with a unique id
     * and the current date.
     *
     * New attendace is recorded for each student by incrementing his absence, adding the current
     * date to his absence details and resetting hasRecordedAttendance property,
     * if the student came from anoter group, we only set attendedFromAnotherGroup to false
     * and do nothing else.
     *
     * Payments
     * if there are availabe attendances remaining the will be decremented,
     * else the un paid attendances will be incremented.
     */

    const assistantId = assistantMiddleware.authorize(token);
    const assistant = await validator.validateAssistantExistence(assistantId);
    const group = await validator.validateGroupExistence(groupId);
    const teacher = await teacherCollection.findById(assistant.teacherId);

    validator.validateGroupCanBeModifiedByAssistant(group, assistant);

    const students = await studentTeacherCollection.find({ groupId: groupId });
    const attendanceId = shortid.generate();

    const nowDate = date || new Date(Date.now()).toLocaleString().split(' ')[0];
    const lastGroupAttendance = group.attendance_record.number ? group.attendance_record.details[0].date : '';

    if (lastGroupAttendance === nowDate)
      throw new errorHandler.DoublicateEntry(`Group has already recorded attendance at ${nowDate}`);

    group.attendance_record.number++;
    group.attendance_record.details.unshift({
      _id: attendanceId,
      date: nowDate // returning the date only
    });

    // TODO: handle mutliple groups at the start week
    if (group.day === teacher.weekStart) {
      await studentTeacherCollection.updateMany(
        { teacherId: teacher._id },
        { 'attendance.hasRecordedAttendance': false }
      );
    }

    students.forEach(async s => {
      if (s.attendance.attendedFromAnotherGroup) {
        s.attendance.attendedFromAnotherGroup = false;
      } else {
        // absence record
        s.absence.number++;
        s.absence.details.unshift(nowDate);

        // payment record
        if (teacher.takeMoneyOnAbsence) {
          s.attendancePayment.nAvailableAttendances
            ? s.attendancePayment.nAvailableAttendances--
            : s.attendancePayment.nUnpaidAttendances++;
        }
      }
      await s.save();
    });

    group.attendance_analytics.unshift({ date: nowDate, absence: group.students.number });
    await group.save();
    return { _id: attendanceId, date: nowDate, groupId };
  }

  async showRecentAttendanceDetails(token, groupId) {
    /**
     * @param token -> assistant jwt
     * @param groupId -> the group that will return the latest attendance details
     * @returns the last attendance details if found else retuns {}
     */

    const assistantId = assistantMiddleware.authorize(token);
    const assistant = await validator.validateAssistantExistence(assistantId);
    const group = await validator.validateGroupExistence(groupId);

    validator.validateGroupCanBeModifiedByAssistant(group, assistant);

    if (!group.attendance_record.details) {
      throw new errorHandler.NotAllowed('There are no recorded attendances');
    }

    const response = group.attendance_record.details[0]
      ? { _id: group.attendance_record.details[0]._id, groupId: group._id }
      : {};
    return response;
  }

  async reverseLastAttendanceRecord(token, groupId) {
    const assistantId = assistantMiddleware.authorize(token);
    const assistant = await validator.validateAssistantExistence(assistantId);
    const group = await validator.validateGroupExistence(groupId);

    validator.validateGroupCanBeModifiedByAssistant(group, assistant);

    if (!group.attendance_record.details) {
      throw new errorHandler.NotAllowed('There are no recorded attendances');
    }

    const DATE_TO_REMOVE = group.attendance_record.details[0].date;
    const nowDate = new Date(Date.now()).toLocaleString().split(' ')[0];

    if (!nowDate === DATE_TO_REMOVE) {
      throw new errorHandler.NotAllowed('Group has not recorded attendance today');
    }

    group.attendance_record.details.shift();
    group.attendance_record.number--;

    // students who are recorded absent in that group, absence date is used to verify that the student is not added after the group
    // has recorded the wrong attendance.
    const students = await studentTeacherCollection.find({
      groupId,
      'absence.details': DATE_TO_REMOVE
    });

    students.forEach(async student => {
      student.absence.details.shift();
      student.absence.number--;
      await student.save();
    });

    group.attendance_analytics.shift();
    await group.save();
    return { status: 200 };
  }

  static async attendanceHandler(teacher, group, student, date) {
    if (!group.attendance_record.details.length) throw new errorHandler.GroupHasNoAttendanceRecord();

    const attendanceDate = date || group.attendance_record.details[0].date;
    let removeAbsence = true;

    if (student.attendance.hasRecordedAttendance) {
      throw new errorHandler.StudentHasRecordedAttendance();
    } else if (student.groupId !== group._id) {
      const studentGroup = await validator.validateGroupExistence(student.groupId);
      const studentGroupDay = teacher.weekDays.findIndex(d => d === studentGroup.day);
      const groupDay = teacher.weekDays.findIndex(d => d === group.day);

      const lastStudentGroupAttendance = studentGroup.attendance_record.details.length
        ? studentGroup.attendance_record.details[0].date
        : ''; // the comparison should always evaluate to false

      const lastGroupAttendance = group.attendance_record.details[0].date;
      group.attendance_analytics[0].fromAnotherGroup++;

      // cases where student will record attendance normally in his comming group attendnace record
      // if (
      //   studentGroup.day === teacher.weekStart ||
      //   studentGroupDay < groupDay ||
      //   (groupDay === studentGroupDay && lastStudentGroupAttendance === lastGroupAttendance)
      // ) {
      //   removeAbsence = true;
      // }

      // cases where student will not record attendance in his group
      if (
        groupDay < studentGroupDay ||
        (groupDay === studentGroupDay && lastStudentGroupAttendance !== lastGroupAttendance)
      ) {
        removeAbsence = false;
        student.attendance.attendedFromAnotherGroup = true;
      }
    }

    group.attendance_analytics[0].attended++;
    if (!student.attendance.attendedFromAnotherGroup) group.attendance_analytics[0].absence--;

    if (removeAbsence && student.absence.number) {
      //   // avoid students added after setting new attendance record
      //   // to have absence = -1
      student.absence.number--;
      student.absence.details.shift();
    }

    student.attendance.number++;
    student.attendance.details.unshift(attendanceDate);
    student.attendance.hasRecordedAttendance = true;
    student.attendance.lastAttendanceId = group._id;

    if (!teacher.takeMoneyOnAbsence) {
      student.attendancePayment.nAvailableAttendances
        ? student.attendancePayment.nAvailableAttendances--
        : student.attendancePayment.nUnpaidAttendances++;
    }

    await group.save();
    await student.save();
  }

  async recordAttendance(token, groupId, studentId, date) {
    /**
     * @param token -> json web token
     * @param groupId -> the group id at wich the attendance will be recorded
     * @param studentId -> the id of the student that will record attendance
     * @returns the student after attendance has been recorded
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
     */

    const assistantId = assistantMiddleware.authorize(token);
    const assistant = await validator.validateAssistantExistence(assistantId);

    const group = await validator.validateGroupExistence(groupId);
    validator.validateGroupCanBeModifiedByAssistant(group, assistant);

    const student = await validator.validateStudentExistence(studentId);
    validator.validateStudentCanBeModifiedByAssistant(student, assistant);

    const teacher = await teacherCollection.findById(assistant.teacherId);

    await GroupService.attendanceHandler(teacher, group, student, date);
    return student;
  }

  async showAbsentStudents(token, groupId) {
    const assistantId = assistantMiddleware.authorize(token);
    const assistant = await validator.validateAssistantExistence(assistantId);

    const allGroupStudents = await studentTeacherCollection.find({
      teacherId: assistant.teacherId,
      groupId,
      'attendance.hasRecordedAttendance': false
    });
    const studentsDetails = allGroupStudents.map(s => ({
      _id: s._id,
      name: s.name
    }));

    return studentsDetails;
  }

  async getLastAttendanceAnalytics(token, groupId) {
    const assistantId = assistantMiddleware.authorize(token);
    const assistant = await validator.validateAssistantExistence(assistantId);

    const group = await validator.validateGroupExistence(groupId);
    validator.validateGroupCanBeModifiedByAssistant(group, assistant);

    return group.attendance_analytics[0];
  }

  async setAttendancePaymentAmount(token, body, type) {
    /**
     * @param token -> assistant jwt
     * @param body -> amount is expected
     * @param type -> the type of the payment to be set (can only be lesson or month)
     * @returns {status: 200}
     * @throws if the type is invalid
     *
     * Sets the monthly attendance payment and the lesson attendance payments
     */

    const assistantId = assistantMiddleware.authorize(token);
    const assistant = await validator.validateAssistantExistence(assistantId);

    schema.paymentAmount(body);
    validator.validateAmount(body.amount);

    switch (type) {
      case 'lesson':
        await teacherCollection.updateMany(
          { _id: assistant.teacherId },
          { attendancePayment: body.amount },
          { new: true, strict: false }
        );
        break;
      case 'month':
        await teacherCollection.updateMany(
          { _id: assistant.teacherId },
          { monthlyPayment: body.amount },
          { new: true, strict: false }
        );
        break;
      default:
        throw new errorHandler.InvalidPaymentType('type can only be "lesson" or "month"');
    }

    return { status: 200 };
  }

  async setTakeMoneyOnAbsence(token, value) {
    const assistantId = assistantMiddleware.authorize(token);
    const assistant = await validator.validateAssistantExistence(assistantId);

    const teacher = await teacherCollection.findById(assistant.teacherId);
    if (value === 'true') {
      teacher.takeMoneyOnAbsence = true;
    } else if (value === 'false') {
      teacher.takeMoneyOnAbsence = false;
    } else {
      throw new errorHandler.NotAllowed('value can only be true or false');
    }

    await teacher.save();
    return { status: 200 };
  }

  async setNAttendancesPerMonth(token, body) {
    /**
     * @param token -> assistant jwt
     * @param body -> number is expected
     * @returns { status: 200 }
     *
     * Sets the number of attendances for each month before a new payment
     * is required from the student
     */

    const assistantId = assistantMiddleware.authorize(token);
    const assistant = await validator.validateAssistantExistence(assistantId);

    schema.nAttendancesPerMonth(body);
    await teacherCollection.updateMany(
      { _id: assistant.teacherId },
      { $set: { nAttendancePerMonth: body.number } },
      { strict: false }
    );

    return { status: 200 };
  }

  async setCustomPayment(token, body, type, studentId) {
    //  authorizing and validating the token to be of an assistant
    const assistantId = assistantMiddleware.authorize(token);
    const assistant = await validator.validateAssistantExistence(assistantId);

    // validating studentId and that he is with the same teacher as the assistant
    const student = await validator.validateStudentExistence(studentId);
    validator.validateStudentCanBeModifiedByAssistant(student, assistant);

    schema.paymentAmount(body);
    switch (type) {
      case 'books':
        student.customBooksPayment = body.amount;
        break;
      case 'attendance':
        student.customMonthlyAttendancePayment = body.amount;
        break;
      default:
        throw new errorHandler.InvalidPaymentType('type can only be "books" or "attendance"');
    }

    await student.save();
    return student;
  }

  async payAttendance(token, studentId, type, customValue) {
    /**
     * @param token -> json web token
     * @param studentId -> the id of the student that will record attendance
     * @returns the update student info.
     *
     * Increments attendancePyament number for student and add the current date
     * to the details of the payment, this method can be called as many times as needed
     * and should be reversed by reversePayAttendance.
     */

    //  authorizing and validating the token to be of an assistant
    const assistantId = assistantMiddleware.authorize(token);
    const assistant = await validator.validateAssistantExistence(assistantId);

    // validating studentId and that he is with the same teacher as the assistant
    const student = await validator.validateStudentExistence(studentId);
    validator.validateStudentCanBeModifiedByAssistant(student, assistant);

    const previousNAvailableAttendances = student.attendancePayment.nAvailableAttendances;
    const previousNUnpaidAttendances = student.attendancePayment.nUnpaidAttendances;

    let { monthlyPayment, nAttendancePerMonth, attendancePayment } = await teacherCollection.findById(
      assistant.teacherId
    );

    if (!monthlyPayment || !nAttendancePerMonth || !attendancePayment) {
      throw new errorHandler.NotAllowed('Lack of group payments info');
    }

    if (student.customMonthlyAttendancePayment) {
      monthlyPayment = student.customMonthlyAttendancePayment;
    }

    monthlyPayment = customValue >= 0 ? parseFloat(customValue) : monthlyPayment;
    attendancePayment = customValue >= 0 ? parseFloat(customValue) : attendancePayment;
    switch (type) {
      case 'month':
        student.attendancePayment.number++;
        student.attendancePayment.amount = monthlyPayment;
        student.attendancePayment.totalPaid += monthlyPayment;

        if (student.attendancePayment.nUnpaidAttendances > nAttendancePerMonth) {
          student.attendancePayment.nUnpaidAttendances -= nAttendancePerMonth;
          student.attendancePayment.nAvailableAttendances = 0;
        } else {
          student.attendancePayment.nAvailableAttendances +=
            nAttendancePerMonth - student.attendancePayment.nUnpaidAttendances;
          student.attendancePayment.nUnpaidAttendances = 0;
        }
        break;
      case 'lesson':
        student.attendancePayment.number++;
        student.attendancePayment.amount = attendancePayment;
        student.attendancePayment.totalPaid += attendancePayment;
        student.attendancePayment.nUnpaidAttendances--;
        break;
      default:
        throw new errorHandler.InvalidPaymentType('type can only be "month" or "lesson"');
    }

    student.attendancePayment.details.unshift({
      amount: student.attendancePayment.amount,
      previousNAvailableAttendances,
      previousNUnpaidAttendances,
      date: new Date(Date.now()).toLocaleString().split(' ')[0]
    });

    await student.save();
    return student;
  }

  async reversePayAttendance(token, studentId) {
    /**
     * @param token -> json web token
     * @param studentId -> the id of the student that will record attendance
     * @returns the updated student info
     *
     * Decrement attendancePyament number for student and remove the last
     * payment details, this method will throw an error if it is called and there is 0
     * attendancePayment.
     */

    const assistantId = assistantMiddleware.authorize(token);
    const assistant = await validator.validateAssistantExistence(assistantId);

    const student = await validator.validateStudentExistence(studentId);
    validator.validateStudentCanBeModifiedByAssistant(student, assistant);

    // the or statement is to make sure it doesn't make an invalid operation,
    // although it should be impossible to happen.
    if (student.attendancePayment.number === 0) throw new errorHandler.ReachedMaxReversePayValue();

    // getting the details of the last payment
    const lastPaymentDetails = student.attendancePayment.details.shift();

    student.attendancePayment.number--;
    student.attendancePayment.totalPaid -= lastPaymentDetails.amount;
    student.attendancePayment.nAvailableAttendances = lastPaymentDetails.previousNAvailableAttendances;
    student.attendancePayment.nUnpaidAttendances = lastPaymentDetails.previousNUnpaidAttendances;

    // const remainingDays = nAttendancePerMonth - student.attendancePayment.nAvailableAttendances;
    // if (remainingDays >= 0) {
    //   student.attendancePayment.nAvailableAttendances += 4;
    //   // student.attendancePayment.nUnpaidAttendances = remainingDays;
    // } else {
    //   student.attendancePayment.nAvailableAttendances -= nAttendancePerMonth;
    //   student.attendancePayment.nUnpaidAttendances = 0;
    // }

    await student.save();
    return student;
  }

  async showTodayGroupPayment(token, groupId, date) {
    const assistantId = assistantMiddleware.authorize(token);
    const assistant = await validator.validateAssistantExistence(assistantId);

    const group = await validator.validateGroupExistence(groupId);
    validator.validateGroupCanBeModifiedByAssistant(group, assistant);

    if (!group.attendance_record.details.length) throw new errorHandler.GroupHasNoAttendanceRecord();

    const nowDate = date || group.attendance_record.details[0].date;

    const payments = await studentTeacherCollection.find({
      teacherId: group.teacherId,
      'attendance.lastAttendanceId': groupId,
      $or: [{ 'attendancePayment.details.date': nowDate }, { 'booksPayment.details.date': nowDate }]
    });
    // .sort({ studentNumber: 1 });

    payments.sort(
      (a, b) => parseInt(a.studentNumber.match(/\d+/g)[0]) - parseInt(b.studentNumber.match(/\d+/g)[0])
    );
    let result = {
      overallPayment: 0,
      totalAttendancePayment: 0,
      totalBooksPayment: 0,
      details: []
    };

    for (let student of payments) {
      let studetTotalAttendancePayment = 0;
      let studetTotalBooksPayment = 0;

      if (student.attendancePayment.details) {
        for (let attendancePaymentDetail of student.attendancePayment.details) {
          if (attendancePaymentDetail.date === nowDate) {
            result.totalAttendancePayment += attendancePaymentDetail.amount;
            studetTotalAttendancePayment += attendancePaymentDetail.amount;
          }
        }
      }

      if (student.booksPayment.details) {
        for (let bookPaymentDetail of student.booksPayment.details) {
          if (bookPaymentDetail.date === nowDate) {
            result.totalBooksPayment += bookPaymentDetail.amount;
            studetTotalBooksPayment += bookPaymentDetail.amount;
          }
        }
      }

      result.details.push({
        name: student.name,
        studentNumber: student.studentNumber,
        attendancePayment: studetTotalAttendancePayment,
        booksPayment: studetTotalBooksPayment
      });
    }

    result.overallPayment = result.totalAttendancePayment + result.totalBooksPayment;
    return result;
  }

  async setBooksPayment(token, body) {
    /**
     * @param token -> assistant jwt
     * @param body -> amound is expected
     * @returns { status: 200 }
     *
     * Sets books payment for all the groups
     */

    const assistantId = assistantMiddleware.authorize(token);
    const assistant = await validator.validateAssistantExistence(assistantId);

    schema.paymentAmount(body);
    validator.validateAmount(body.amount);

    await teacherCollection.updateMany(
      { _id: assistant.teacherId },
      { booksPayment: body.amount },
      { new: true, strict: false }
    );

    return { status: 200 };
  }

  async takeBooksPayment(token) {
    /**
     * @param token -> assistant jwt
     * @returns { status: 200 }
     * @throws if the books payment is not set
     * Takes the books payment from all the students
     */

    const assistantId = assistantMiddleware.authorize(token);
    const assistant = await validator.validateAssistantExistence(assistantId);

    const { booksPayment } = await teacherCollection.findById(assistant.teacherId);
    if (!booksPayment) throw new errorHandler.NotAllowed('Lack of books payment information');

    await teacherCollection.updateMany(
      { _id: assistant.teacherId },
      { $inc: { nBooksPayment: 1 } },
      { strict: false }
    );

    // students who has custom books payment
    const students = await studentTeacherCollection.find({
      teacherId: assistant.teacherId,
      customBooksPayment: { $gt: 0 }
    });

    for (let i = 0; i < students.length; i++) {
      students[i].booksPayment.totalUnpaid += students[i].customBooksPayment;
      await students[i].save();
    }

    await studentTeacherCollection.updateMany(
      { teacherId: assistant.teacherId, customBooksPayment: { $not: { $gt: 0 } } },
      {
        $inc: {
          'booksPayment.totalUnpaid': booksPayment
        }
      }
    );

    return { status: 200 };
  }

  async reverseTakeBooksPayment(token) {
    /**
     * @param token -> assistant jwt
     *
     * Reverses the take bookse payment action.
     */

    const assistantId = assistantMiddleware.authorize(token);
    const assistant = await validator.validateAssistantExistence(assistantId);

    const { booksPayment, nBooksPayment } = await teacherCollection.findById(assistant.teacherId);
    if (!nBooksPayment) throw new errorHandler.ReachedMaxReversePayValue();

    await teacherCollection.updateMany({ _id: assistant.teacherId }, { $inc: { nBooksPayment: -1 } });

    // students who has custom books payment
    const students = await studentTeacherCollection.find({
      teacherId: assistant.teacherId,
      customBooksPayment: { $gt: 0 }
    });

    for (let i = 0; i < students.length; i++) {
      students[i].booksPayment.totalUnpaid -= students[i].customBooksPayment;
      await students[i].save();
    }

    await studentTeacherCollection.updateMany(
      { teacherId: assistant.teacherId, customBooksPayment: { $not: { $gt: 0 } } },
      {
        $inc: {
          'booksPayment.totalUnpaid': -booksPayment
        }
      }
    );

    return { status: 200 };
  }

  async payBooks(token, studentId, customValue) {
    /**
     * @param token -> assistant jwt
     * @param studentId -> the studen that will pay the books
     *
     * books payment number is incremented and the payment date is
     * added to the details
     */

    const assistantId = assistantMiddleware.authorize(token);
    const assistant = await validator.validateAssistantExistence(assistantId);

    const student = await validator.validateStudentExistence(studentId);
    validator.validateStudentCanBeModifiedByAssistant(student, assistant);

    let { nBooksPayment, booksPayment } = await teacherCollection.findById(assistant.teacherId);

    if (!booksPayment) throw new errorHandler.PaymentAmountIsUnknown('Books payment is unknown');
    if (nBooksPayment === student.booksPayment.number)
      throw new errorHandler.PaymentIsAlreadyPaid('Already paid all the money');

    if (student.customBooksPayment) {
      booksPayment = student.customBooksPayment;
    }

    booksPayment = customValue >= 0 ? parseFloat(customValue) : booksPayment;
    student.booksPayment.number++;
    student.booksPayment.totalPaid += booksPayment;
    student.booksPayment.totalUnpaid -= booksPayment;
    student.booksPayment.details.unshift({
      amount: booksPayment,
      date: new Date(Date.now()).toLocaleString().split(' ')[0]
    });

    await student.save();
    return student;
  }

  async reversePayBooks(token, studentId) {
    /**
     * @param token -> assistant jwt
     * @param student -> the student that will reverse the payment
     *
     * Decrements the books payment and remove the last book payment details
     */

    const assistantId = assistantMiddleware.authorize(token);
    const assistant = await validator.validateAssistantExistence(assistantId);

    const student = await validator.validateStudentExistence(studentId);
    validator.validateStudentCanBeModifiedByAssistant(student, assistant);

    if (student.booksPayment.number === 0) throw new errorHandler.ReachedMaxReversePayValue();

    // getting the details of the last payment
    const lastPaymentDetails = student.booksPayment.details.shift();

    student.booksPayment.number--;
    student.booksPayment.totalPaid -= lastPaymentDetails.amount;
    student.booksPayment.totalUnpaid += lastPaymentDetails.amount;

    await student.save();
    return student;
  }

  async getStudentsWhoHasNotPaid(token, groupId) {
    /**
     * 
     */

    const assistantId = assistantMiddleware.authorize(token);
    const assistant = await validator.validateAssistantExistence(assistantId);

    const teacher = await teacherCollection.findById(assistant.teacherId);

    const group = await validator.validateGroupExistence(groupId);
    validator.validateGroupCanBeModifiedByAssistant(group, assistant);

    const result = [
      // {
      //   name: "Student",
      //   studentNumber: "12C"
      //   nUnpaidAttendances: Number,
      //   totalUnpaidBooks: Number
      // }
    ]

    const students = await studentTeacherCollection.find({ 
      groupId, 
      $or: [
              { 'attendancePayment.nUnpaidAttendances': { $gt: 0 }}, 
              { 'booksPayment.totalUnpaid': { $gt: 0 }},
              { 'booksPayment.totalPaid': 0, 'attendance.number': { $gte: 1} },
              { 'booksPayment.totalUnpaid': { $lt: 0, $gt: -400 }}
            ]
    });

    students.sort(
      (a, b) => parseInt(a.studentNumber.match(/\d+/g)[0]) - parseInt(b.studentNumber.match(/\d+/g)[0])
    );

    for (let student of students) {
      let totalUnpaidBooks = 0;
      if (student.booksPayment.totalUnpaid === 0 && student.booksPayment.totalPaid === 0) {
        totalUnpaidBooks = teacher.booksPayment * teacher.nBooksPayment;
      } else if (student.booksPayment.totalUnpaid < 0) {
        totalUnpaidBooks = student.booksPayment.totalUnpaid + (teacher.booksPayment * teacher.nBooksPayment);
      }

      result.push({
        studentNumber: student.studentNumber,
        name: student.name,
        nUnpaidAttendances: student.attendancePayment.nUnpaidAttendances,
        totalUnpaidBooks: totalUnpaidBooks || student.booksPayment.totalUnpaid
      });
    
    return result;
  }

  async getStudentDetails(token, studentId) {
    /**
     * @param token -> assistant jwt
     * @param student -> the student that will reverse the payment
     * @returns all the information the assistant knows about the student
     */

    const assistantId = assistantMiddleware.authorize(token);
    const assistant = await validator.validateAssistantExistence(assistantId);

    const student = await validator.validateStudentExistence(studentId);
    validator.validateStudentCanBeModifiedByAssistant(student, assistant);

    return student;
  }

  async changeGroup(token, fromGroupId, toGroupId, studentId) {
    const assistantId = assistantMiddleware.authorize(token);
    const assistant = await validator.validateAssistantExistence(assistantId);

    const fromGroup = await validator.validateGroupExistence(fromGroupId);
    const toGroup = await validator.validateGroupExistence(toGroupId);
    validator.validateGroupCanBeModifiedByAssistant(fromGroup, assistant);
    validator.validateGroupCanBeModifiedByAssistant(toGroup, assistant);

    const student = await validator.validateStudentExistence(studentId);
    validator.validateStudentCanBeModifiedByAssistant(student, assistant);

    for (let i = 0; i < fromGroup.students.details.length; i++) {
      if (fromGroup.students.details[i]._id === studentId) {
        fromGroup.students.details.splice(i, 1);
        fromGroup.students.number--;
        break;
      } else if (i === fromGroup.students.details.length - 1) {
        throw new errorHandler.StudentIsNotInGroup();
      }
    }

    toGroup.students.number++;
    toGroup.students.details.push({ _id: studentId, name: student.name });

    student.groupId = toGroup._id;

    await fromGroup.save();
    await toGroup.save();
    await student.save();

    return student;
  }
}

exports.GroupService = GroupService;
