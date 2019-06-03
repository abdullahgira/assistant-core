const generalErrorHandler = require('../error');
const { studentCollection } = require('./model');
const schema = require('./schema');

class StudentService {
  static async register(body) {
    const { error } = schema.register(body);
    if (error) throw new generalErrorHandler.ValidationError(error.details[0].message);

    const student = new studentCollection({
      name: body.name,
      phone: body.phone,
      address: body.address,
      age: body.age
    });

    await student.save();
    return student;
  }
}

exports.StudentService = StudentService;
