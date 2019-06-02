const errorHandler = require('./error');
const { groupCollection } = require('./model');

const { assistantCollection } = require('../users/assistant/model');
const { studentTeacherCollection } = require('../users/studentTeacher.model');
const generalUserErrorHandler = require('../users/error');

exports.validateAssistantExistence = async assistantId => {
  const assistant = await assistantCollection.findById(assistantId);
  if (!assistant) throw new generalUserErrorHandler.InvalidToken();
  return assistant;
};

exports.validateGroupExistence = async groupId => {
  const group = await groupCollection.findById(groupId);
  if (!group) throw new errorHandler.InvalidGroupId();
  return group;
};

exports.validateStudentExistence = async studentId => {
  const student = await studentTeacherCollection.findById(studentId);
  if (!student) throw new generalUserErrorHandler.InvalidUserId();
  return student;
};

exports.validateGroupCanBeModifiedByAssistant = (group, assistant) => {
  if (group.teacherId !== assistant.teacherId) throw new errorHandler.Forbidden();
};

exports.validateStudentCanBeModifiedByAssistant = (student, assistant) => {
  if (student.teacherId !== assistant.teacherId) throw new errorHandler.Forbidden();
};
