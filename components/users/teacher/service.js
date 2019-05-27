const shortid = require('shortid');

const generalErrorHandler = require('../error');
const middleware = require('./middleware');
const { teacherCollection } = require('./model');
const schema = require('./schema');

const { assistantCollection } = require('../assistant/model');

class TeacherService {
  static async register(body) {
    const { error } = schema.register(body);
    if (error) throw new generalErrorHandler.ValidationError(error.details[0].message);

    const teacher = new teacherCollection({
      name: body.name,
      phone: body.phone,
      subject: body.subject
    });

    await teacher.save();
    return teacher;
  }

  async addAssistant(body, token) {
    // validating token and that the action is made by the teacher
    if (!token) throw new generalErrorHandler.NoTokenProvided();
    const teacherId = middleware.authorize(token);

    // assistant schema validation from teacher
    const { error } = schema.addAssistant(body);
    if (error) throw new generalErrorHandler.ValidationError(error.details[0].message);

    // finding the teacher with that teacherId
    const teacher = await teacherCollection.findById(teacherId);
    if (!teacher) throw new generalErrorHandler.ValidationError();

    const code = shortid.generate();
    const assistant = new assistantCollection({
      _id: code,
      name: body.name,
      teacher: teacherId
    });

    teacher.assistants.number++;
    teacher.assistants.details.unshift({
      _id: code,
      name: body.name
    });

    await teacher.save();
    await assistant.save();
    return { code };
  }
}

exports.TeacherService = TeacherService;
