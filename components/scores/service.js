const errorHandler = require('./error');
const schema = require('./schema');

// const { studentTeacherCollection } = require('../users/studentTeacher.model');
const groupsValidator = require('../groups/validator');
const { teacherCollection } = require('../users/teacher/model');
const { studentTeacherCollection } = require('../users/studentTeacher.model');
const assistantMiddleware = require('../users/assistant/middleware');

class ScoreService {
  async getScores(token, studentId) {
    assistantMiddleware.authorize(token);
    const student = await groupsValidator.validateStudentExistence(studentId);

    return student.scores;
  }

  async scoresDates(token, groupId) {
    const assistantId = assistantMiddleware.authorize(token);
    const assistant = await groupsValidator.validateAssistantExistence(assistantId);

    const group = await groupsValidator.validateGroupExistence(groupId);
    groupsValidator.validateGroupCanBeModifiedByAssistant(group, assistant);

    const attendanceDetails = group.attendance_record.details.map(a => a.date);
    const uniqueAttendanceDates = attendanceDetails.filter((v, i) => attendanceDetails.indexOf(v) === i);

    return uniqueAttendanceDates;
  }

  async getScoresBasedOnDate(token, groupId, date) {
    const assistantId = assistantMiddleware.authorize(token);
    const assistant = await groupsValidator.validateAssistantExistence(assistantId);

    const group = await groupsValidator.validateGroupExistence(groupId);
    groupsValidator.validateGroupCanBeModifiedByAssistant(group, assistant);

    const students = await studentTeacherCollection.find({ 'scores.date': date });
    const studentsScores = students.map(s => ({ _id: s._id, name: s.name, score: s.scores[0] }));
    return studentsScores;
  }

  async getLastAttendedStudents(token, groupId) {
    const assistantId = assistantMiddleware.authorize(token);
    const assistant = await groupsValidator.validateAssistantExistence(assistantId);

    const group = await groupsValidator.validateGroupExistence(groupId);
    groupsValidator.validateGroupCanBeModifiedByAssistant(group, assistant);

    let lastAttendanceDate = 0;
    if (group.attendance_record.details[0]) {
      lastAttendanceDate = group.attendance_record.details[0].date;
      return await studentTeacherCollection.find({ 'attendance.details': lastAttendanceDate });
    } else {
      return [];
    }
  }

  async setMaxAndRedoScores(token, body, type) {
    const assistantId = assistantMiddleware.authorize(token);
    const assistant = await groupsValidator.validateAssistantExistence(assistantId);

    switch (type) {
      case 'redo': {
        const { error } = schema.setRedoScores(body);
        if (error) throw new errorHandler.InvalidBody(error.details[0].message);

        await teacherCollection.updateOne(
          { _id: assistant.teacherId },
          { $set: { redoScore: body.score } },
          { strict: false }
        );
        break;
      }
      case 'max': {
        const { error } = schema.setMaxScores(body);
        if (error) throw new errorHandler.InvalidBody(error.details[0].message);

        await teacherCollection.updateOne(
          { _id: assistant.teacherId },
          { $set: { maxScore: body.score } },
          { strict: false }
        );
        break;
      }
      default:
        throw new errorHandler.InvalidType('Type can only be max or redo');
    }

    return { status: 200 };
  }

  async addScore(token, body, groupId, studentId) {
    const assistantId = assistantMiddleware.authorize(token);
    const assistant = await groupsValidator.validateAssistantExistence(assistantId);

    const group = await groupsValidator.validateGroupExistence(groupId);
    groupsValidator.validateGroupCanBeModifiedByAssistant(group, assistant);

    const student = await groupsValidator.validateStudentExistence(studentId);
    groupsValidator.validateStudentCanBeModifiedByAssistant(student, assistant);

    const { error } = schema.addScore(body);
    if (error) throw new errorHandler.InvalidBody(error.details[0].message);

    const { maxScore, redoScore } = await teacherCollection.findById(assistant.teacherId);
    if (!maxScore) {
      throw new errorHandler.InvalidScoreValue('You have to set Max and Redo Scores');
    }

    if (body.score > maxScore) {
      throw new errorHandler.InvalidScoreValue('Score cannot be more than the current max score!');
    }

    if (group.attendance_record.details[0]) {
      let lastGroupAttendanceDate = group.attendance_record.details[0].date;
      let studentHasAttendedLastDate = student.attendance.details[0] === lastGroupAttendanceDate;

      if (studentHasAttendedLastDate) {
        const scoreIdx = student.scores.findIndex(s => s.date === lastGroupAttendanceDate);

        if (scoreIdx !== -1) {
          throw new errorHandler.DuplicateScores();
        }

        const studentScore = {
          score: body.score,
          hasToMakeRedo: redoScore === 0 ? false : body.score <= redoScore,
          hasGotMaxScore: body.score === maxScore,
          date: new Date(Date.now()).toLocaleString().split(' ')[0]
        };

        student.scores.unshift(studentScore);
      } else {
        throw new errorHandler.StudentHasNotAttendedLastGroupAttendance();
      }
    } else {
      throw new errorHandler.GroupHasNoAttendanceRecord();
    }

    await student.save();
    return student.scores;
  }

  async editScore(token, body, groupId, studentId, scoreId) {
    const assistantId = assistantMiddleware.authorize(token);
    const assistant = await groupsValidator.validateAssistantExistence(assistantId);

    const { error } = schema.addScore(body);
    if (error) throw new errorHandler.InvalidBody(error.details[0].message);

    const group = await groupsValidator.validateGroupExistence(groupId);
    groupsValidator.validateGroupCanBeModifiedByAssistant(group, assistant);

    const student = await groupsValidator.validateStudentExistence(studentId);
    groupsValidator.validateStudentCanBeModifiedByAssistant(student, assistant);

    const { maxScore, redoScore } = await teacherCollection.findById(assistant.teacherId);
    if (!maxScore) {
      throw new errorHandler.InvalidScoreValue('You have to set Max and Redo Scores');
    }

    if (body.score > maxScore) {
      throw new errorHandler.InvalidScoreValue(
        `score must be smaller than or equal to the current max score (${maxScore})`
      );
    }

    const studentScore = {
      score: body.score,
      hasToMakeRedo: redoScore === 0 ? false : body.score <= redoScore,
      hasGotMaxScore: body.score === maxScore
    };

    const scoreIndex = student.scores.findIndex(s => String(s._id) === scoreId);
    if (scoreIndex !== -1) {
      student.scores[scoreIndex] = { _id: scoreId, ...studentScore, date: student.scores[scoreIndex].date };
    } else {
      throw new errorHandler.InvalidScoreId();
    }

    await student.save();
    return student.scores;
  }

  async deleteScore(token, groupId, studentId, scoreId) {
    const assistantId = assistantMiddleware.authorize(token);
    const assistant = await groupsValidator.validateAssistantExistence(assistantId);

    const student = await groupsValidator.validateStudentExistence(studentId);

    const group = await groupsValidator.validateGroupExistence(groupId);
    groupsValidator.validateGroupCanBeModifiedByAssistant(group, assistant);

    const newScores = student.scores.filter(s => String(s._id) !== scoreId);
    student.scores = newScores;
    await student.save();

    return student.scores;
  }
}

exports.ScoreService = ScoreService;
