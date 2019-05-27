const schema = require('./schema');
const { groupCollection } = require('./model');
const { teacherCollection } = require('../users/teacher/model');
const { assistantCollection } = require('../users/assistant/model');
const assistantMiddleware = require('../users/assistant/middleware');
const generalUserErrorHandler = require('../users/error');

const errorHandler = require('./error');

class GroupService {
  async createGroup(body, token) {
    if (!token) throw new generalUserErrorHandler.NoTokenProvided();
    const assistantId = assistantMiddleware.authorize(token);

    // finding the assistant with the assistantId
    const assistant = await assistantCollection.findById(assistantId);
    if (!assistant) throw new generalUserErrorHandler.InvalidToken();

    // validate body schema
    const { error } = schema.createGroup(body);
    if (error) throw new errorHandler.GroupCreationError(error.details[0].message);

    const group = new groupCollection({
      name: body.name
    });

    const teacher = await teacherCollection.findById(assistant.teacher);
    teacher.groups.number++;
    teacher.groups.details.push({ _id: group._id, name: body.name });

    await group.save();
    await teacher.save();

    return group;
  }
}

exports.GroupService = GroupService;
