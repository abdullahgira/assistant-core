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
  phone: { type: String, default: '' },
  parentPhone: { type: String, default: '' },
  address: { type: String },
  studentNumber: { type: String, default: '' },
  customMonthlyAttendancePayment: { type: Number, default: 0 },
  customBooksPayment: { type: Number, default: 0 },
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
    totalPaid: { type: Number, default: 0 },
    nAvailableAttendances: { type: Number, default: 0 },
    nUnpaidAttendances: { type: Number, default: 0 },
    // totalUnpaid: { type: Number, default: 0 },
    details: [
      {
        amount: { type: Number, default: 0 },
        date: { type: String, default: '' },
        previousNAvailableAttendances: { type: Number, default: 0 },
        previousNUnpaidAttendances: { type: Number, default: 0 }
      }
    ]
  },
  booksPayment: {
    number: { type: Number, default: 0 },
    totalPaid: { type: Number, default: 0 },
    totalUnpaid: { type: Number, default: 0 },
    details: [{ amount: Number, date: String }]
  },
  scores: [
    {
      score: Number,
      hasToMakeRedo: Boolean,
      hasGotMaxScore: Boolean,
      date: String
    }
  ]
});

exports.studentTeacherCollection = mongoose.model('StudentTeacher', studentTeacherSchema);
