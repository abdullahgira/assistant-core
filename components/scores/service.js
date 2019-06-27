const errorHandler = require('./error');
const schema = require('./schema');

// const { studentTeacherCollection } = require('../users/studentTeacher.model');
const groupsValidator = require('../groups/validator');
const { teacherCollection } = require('../users/teacher/model');
const assistantMiddleware = require('../users/assistant/middleware');

class ScoreService {
  async addScore(token, studentId, body) {
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

    student.scores.shift(studentScore);
    return student.scores;
  }
}

exports.ScoreService = ScoreService;
