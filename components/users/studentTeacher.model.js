const mongoose = require('mongoose');
const { Schema } = mongoose;

const studentTeacherSchema = new Schema({
  _id: String,
  teacherId: String,
  groupId: String,
  studentId: String,
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 4,
    maxlength: 50
  },
  phone: {
    type: String,
    default: ''
  },
  attendance: {
    number: { type: Number, default: 0 },
    details: [Date]
  },
  attendancePayment: {
    number: { type: Number, default: 0 },
    details: [Date]
  },
  booksPayment: {
    number: { type: Number, default: 0 },
    details: [Date]
  }
});

exports.studentTeacherCollection = mongoose.model('StudentTeacher', studentTeacherSchema);
