const generalErrorHandler = require('../error');
const { teacherCollection } = require('./model');
const { validateRegister } = require('./schema');


class TeacherService {
  static async register(body) {
    const { error } = validateRegister(body);
    if (error) throw new generalErrorHandler.ValidationError(error.details[0].message);

    const teacher = new teacherCollection({
      name: body.name,
      phone: body.phone,
      subject: body.subject
    });

    await teacher.save();
    return teacher;
  }
}

exports.TeacherService = TeacherService;