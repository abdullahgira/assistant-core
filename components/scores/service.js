const errorHandler = require('./error');
const schema = require('./schema');

// const { studentTeacherCollection } = require('../users/studentTeacher.model');
const groupsValidator = require('../groups/validator');
const { teacherCollection } = require('../users/teacher/model');
const assistantMiddleware = require('../users/assistant/middleware');

class ScoreService {
  async getScores(token, studentId) {
    assistantMiddleware.authorize(token);
    const student = await groupsValidator.validateStudentExistence(studentId);

    return student.scores;
  }

  async setMaxAndRedoScores(token, body, type) {
    const assistantId = assistantMiddleware.authorize(token);
    const assistant = await groupsValidator.validateAssistantExistence(assistantId);

    const { error } = schema.setMaxAndRedoScores(body);
    if (error) throw new errorHandler.InvalidBody(error.details[0].message);

    switch (type) {
      case 'redo':
        await teacherCollection.updateOne(
          { _id: assistant.teacherId },
          { $set: { redoScore: body.score } },
          { strict: false }
        );
        break;
      case 'max':
        await teacherCollection.updateOne(
          { _id: assistant.teacherId },
          { $set: { maxScore: body.score } },
          { strict: false }
        );
        break;
      default:
        throw new errorHandler.InvalidType('Type can only be max or redo');
    }

    return { status: 200 };
  }

  async addOrEditScore(token, body, studentId, scoreId) {
    const assistantId = assistantMiddleware.authorize(token);
    const assistant = await groupsValidator.validateAssistantExistence(assistantId);
    const student = await groupsValidator.validateStudentExistence(studentId);

    const { error } = schema.addScore(body);
    if (error) throw new errorHandler.InvalidBody(error.details[0].message);

    const { maxScore, redoScore } = await teacherCollection.findById(assistant.teacherId);
    if (!maxScore || !redoScore) {
      throw new errorHandler.InvalidScoreValue('You have to set Max and Redo Scores');
    }

    const studentScore = {
      score: body.score,
      hasToMakeRedo: body.score <= redoScore,
      hasGotMaxScore: body.score === maxScore
    };

    if (scoreId) {
      const scoreIndex = student.scores.findIndex(s => String(s._id) === scoreId);
      student.scores[scoreIndex] = studentScore;
    } else {
      student.scores.unshift(studentScore);
    }

    await student.save();
    return student.scores;
  }

  async deleteScore(token, studentId, scoreId) {
    assistantMiddleware.authorize(token);
    const student = await groupsValidator.validateStudentExistence(studentId);

    const newScores = student.scores.filter(s => String(s._id) !== scoreId);
    student.scores = newScores;
    await student.save();

    return student.scores;
  }
}

exports.ScoreService = ScoreService;
