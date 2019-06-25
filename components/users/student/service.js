const generalErrorHandler = require('../error');
const { studentTeacherCollection } = require('../studentTeacher.model');
const { teacherCollection } = require('../teacher/model');

const { studentCollection } = require('./model');
const schema = require('./schema');
const middleware = require('./middleware');
const validator = require('./validator');

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

  async joinTeacher(token, body) {
    const studentId = middleware.authorize(token);

    const { error } = schema.joinTeacher(body);
    if (error) throw new generalErrorHandler.ValidationError(error.details[0].message);

    const student = await studentCollection.findById(studentId);
    const teacher = await teacherCollection.findById(body.teacherId);
    const studentTeacher = await studentTeacherCollection.findById(body.code);

    validator.validateDublicateTeacher(student, teacher._id);

    const { _id: studentTeacherId, teacherId, groupId } = studentTeacher;

    student.teachers.number++;
    student.teachers.details.push({ _id: teacherId, name: teacher.name, groupId, studentTeacherId });

    await student.save();
    return student;
  }

  async viewJoinedTeachers(token) {
    const studentId = middleware.authorize(token);
    const student = await studentCollection.findById(studentId);

    return student.teachers.details;
  }
}

exports.StudentService = StudentService;
