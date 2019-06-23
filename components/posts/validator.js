const schema = require('./schema');
const errorHandler = require('./error');

const { assistantCollection } = require('../users/assistant/model');
const generalUserErrorHandler = require('../users/error');

exports.validateAssistantExistence = async assistantId => {
  const assistant = await assistantCollection.findById(assistantId);
  if (!assistant) throw new generalUserErrorHandler.InvalidToken();
  return assistant;
};

exports.validateCreatePost = body => {
  const { error } = schema.createPost(body);
  if (error) throw new errorHandler.PostCreationError(error.details[0].message);
};
