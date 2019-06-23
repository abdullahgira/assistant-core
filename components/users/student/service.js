const generalErrorHandler = require('../error');
const { studentTeacherCollection } = require('../studentTeacher.model');
const { teacherCollection } = require('../teacher/model');

const { studentCollection } = require('./model');
const schema = require('./schema');
const middleware = require('./middleware');

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

  async joinTeacher(body, token) {
    const studentId = middleware.authorize(token);
    const { error } = schema.joinTeacher(body);
    if (error) throw new generalErrorHandler.ValidationError(error.details[0].message);

    const student = studentCollection.findById(studentId);
    const teacher = teacherCollection.findById(body.teacherId);
    const studentTeacher = studentTeacherCollection.findById(body.code);

    const { _id: studentTeacherId, teacherId, groupId } = studentTeacher;

    student.teachers.number++;
    student.teachers.push({ _id: teacherId, name: teacher.name, groupId, studentTeacherId });

    await student.save();
    return student;
  }
}

exports.StudentService = StudentService;
