const shortid = require('shortid');

const errorHandler = require('./error');
const schema = require('./schema');

// const { studentTeacherCollection } = require('../users/studentTeacher.model');
const groupsValidator = require('../groups/validator');
const { teacherCollection } = require('../users/teacher/model');
const { studentTeacherCollection } = require('../users/studentTeacher.model');
const assistantMiddleware = require('../users/assistant/middleware');

class ScoreService {
  async setNewScoreRecord(token, groupId, date) {
    const assistantId = assistantMiddleware.authorize(token);
    const assistant = await groupsValidator.validateAssistantExistence(assistantId);

    const group = await groupsValidator.validateGroupExistence(groupId);
    groupsValidator.validateGroupCanBeModifiedByAssistant(group, assistant);

    const nowDate = date || new Date(Date.now()).toLocaleString().split(' ')[0];
    group.scores_record.number++;
    group.scores_record.details.unshift({
      _id: shortid.generate(),
      date: nowDate
    });

    await group.save();
    return group.scores_record.details[0];
  }

  async scoresDates(token, groupId) {
    const assistantId = assistantMiddleware.authorize(token);
    const assistant = await groupsValidator.validateAssistantExistence(assistantId);

    const group = await groupsValidator.validateGroupExistence(groupId);
    groupsValidator.validateGroupCanBeModifiedByAssistant(group, assistant);

    const scoresDates = group.scores_record.details.map(s => s.date);
    return scoresDates;
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

  async getMaxAndRedoScores(token) {
    const assistantId = assistantMiddleware.authorize(token);
    const assistant = await groupsValidator.validateAssistantExistence(assistantId);

    const { maxScore, redoScore } = await teacherCollection.findById(assistant.teacherId);
    return { maxScore, redoScore };
  }

  async getGroupStudents(token, groupId) {
    const assistantId = assistantMiddleware.authorize(token);
    const assistant = await groupsValidator.validateAssistantExistence(assistantId);

    const group = await groupsValidator.validateGroupExistence(groupId);
    groupsValidator.validateGroupCanBeModifiedByAssistant(group, assistant);

    if (!group.scores_record.number) throw new errorHandler.GroupHasNoScoreRecord();

    const students = await studentTeacherCollection.find({
      groupId,
      teacherId: assistant.teacherId
    });

    const lastRecordedScore = group.scores_record.details[0].date;
    const studentsDetails = students.map(s => ({
      name: s.name,
      _id: s._id,
      studentNumber: s.studentNumber,
      score: s.scores.length ? (s.scores[0].date === lastRecordedScore ? s.scores[0].score : 0) : 0
    }));

    return studentsDetails;
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
      throw new errorHandler.InvalidScoreValue('you have to set Max Score');
    }

    if (body.score > maxScore) {
      throw new errorHandler.InvalidScoreValue(
        `score must be smaller than or equal to the maximum score (${maxScore})!`
      );
    }

    if (!group.scores_record.details) throw new errorHandler.NoScoreHasBeenRecorded();
    if (student.scores.length && student.scores[0].date === lastGroupScoreRecord)
      throw new errorHandler.DuplicateScores();

    const lastGroupScoreRecord = group.scores_record.details[0].date;

    const studentScore = {
      score: body.score,
      hasToMakeRedo: redoScore === 0 ? false : body.score <= redoScore,
      hasGotMaxScore: body.score === maxScore,
      date: lastGroupScoreRecord
    };

    student.scores.unshift(studentScore);

    await student.save();
    return student.scores[0];
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
      throw new errorHandler.InvalidScoreValue('you have to set max score!');
    }

    if (body.score > maxScore) {
      throw new errorHandler.InvalidScoreValue(
        `score must be smaller than or equal to the maximum score (${maxScore})!`
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

  async getScoresForStudent(token, studentId) {
    const assistantId = assistantMiddleware.authorize(token);
    const assistant = await groupsValidator.validateAssistantExistence(assistantId);

    const student = await groupsValidator.validateStudentExistence(studentId);
    groupsValidator.validateStudentCanBeModifiedByAssistant(student, assistant);

    return student.scores;
  }

  async getScoresBasedOnDate(token, groupId, date) {
    const assistantId = assistantMiddleware.authorize(token);
    const assistant = await groupsValidator.validateAssistantExistence(assistantId);

    const group = await groupsValidator.validateGroupExistence(groupId);
    groupsValidator.validateGroupCanBeModifiedByAssistant(group, assistant);

    const students = await studentTeacherCollection
      .find({
        'scores.date': date,
        teacherId: assistant.teacherId,
        groupId
      })
      .sort({ studentNumber: 1 });
    const studentsScores = students.map(s => ({
      _id: s._id,
      name: s.name,
      score: s.scores[0],
      studentNumber: s.studentNumber
    }));
    return studentsScores;
  }

  async deleteScore(token, groupId, studentId, scoreId) {
    const assistantId = assistantMiddleware.authorize(token);
    const assistant = await groupsValidator.validateAssistantExistence(assistantId);

    const student = await groupsValidator.validateStudentExistence(studentId);
    groupsValidator.validateStudentCanBeModifiedByAssistant(student, assistant);

    const group = await groupsValidator.validateGroupExistence(groupId);
    groupsValidator.validateGroupCanBeModifiedByAssistant(group, assistant);

    const newScores = student.scores.filter(s => String(s._id) !== scoreId);
    student.scores = newScores;
    await student.save();

    return student.scores;
  }
}

exports.ScoreService = ScoreService;
