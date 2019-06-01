const mongoose = require('mongoose');
const { Schema } = mongoose;

const studentTeacherSchema = new Schema({
  _id: String,
  teacherId: String,
  groupId: String,
  studentId: { type: String, default: '' },
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
    attendedFromAnotherGroup: Boolean,
    hasRecordedAttendance: Boolean,
    details: [String]
  },
  absence: {
    number: { type: Number, default: 0 },
    details: [String]
  },
  attendancePayment: {
    number: { type: Number, default: 0 },
    details: [String]
  },
  booksPayment: {
    number: { type: Number, default: 0 },
    details: [String]
  }
});

exports.studentTeacherCollection = mongoose.model('StudentTeacher', studentTeacherSchema);
