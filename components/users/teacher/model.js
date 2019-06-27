const mongoose = require('mongoose');
const shortid = require('shortid');
const { Schema } = mongoose;

const teacherSchema = new Schema({
  _id: {
    type: String,
    default: shortid.generate
  },
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 4,
    maxlength: 50
  },
  phone: {
    type: String,
    default: '',
    required: true,
    validate: {
      validator: v => v && /^\+?[0-9]+/,
      message: 'Not a vlaid phone number, Eg: +2012345678901 or 01234567890'
    }
  },
  students: {
    number: { type: Number, default: 0 },
    details: [{ _id: String, name: String }]
  },
  assistants: {
    number: { type: Number, default: 0 },
    details: [{ _id: String, name: String }]
  },
  groups: {
    number: { type: Number, default: 0 },
    details: [{ _id: String, name: String, day: String }]
  },
  posts: {
    number: { type: Number, default: 0 },
    details: [
      {
        _id: { type: String, required: true },
        title: { type: String, required: true },
        role: { type: String, required: true },
        groupId: { type: String, required: true }
      }
    ]
  },
  subject: String,
  attendancePayment: { type: Number, default: 0 },
  monthlyPayment: { type: Number, default: 0 },
  nAttendancePerMonth: { type: Number, default: 0 },
  booksPayment: { type: Number, default: 0 },
  nBooksPayment: { type: Number, default: 0 },
  maxScore: { type: Number, default: 0 },
  redoScore: { type: Number, default: 0 },
  recentlyVerified: Date
});

exports.teacherCollection = mongoose.model('Teacher', teacherSchema);
