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
    const teacher = await teacherCollection.findById(assistant.teacher);

    const isDuplicateName = teacher.groups.details.filter(g => g.name === body.name.trim());
    if (isDuplicateName) throw new errorHandler.DoublicateEntry();

    const group = new groupCollection({
      name: body.name.trim()
    });

    teacher.groups.number++;
    teacher.groups.details.push({ _id: group._id, name: body.name });

    await group.save();
    await teacher.save();

    return group;
  }

  async addStudent(body, token, groupId) {
    const assistantId = assistantMiddleware.authorize(token);
    console.log(groupId);
    // finding the assistant with the assistantId
    const assistant = await assistantCollection.findById(assistantId);
    if (!assistant) throw new generalUserErrorHandler.InvalidToken();

    // accessing teacher db
    const teacher = await teacherCollection.findById(assistant.teacher);

    // accessing group db
    const group = await groupCollection.findById(groupId);
    if (!group) throw new errorHandler.InvalidGroupId();

    // validate body schema
    const { error } = schema.addStudent(body);
    if (error) throw new errorHandler.GroupCreationError(error.details[0].message);

    const code = shortid.generate();
    const studentTeacher = new studentTeacherCollection({
      _id: code,
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
}

exports.GroupService = GroupService;
