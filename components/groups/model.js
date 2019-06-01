const mongoose = require('mongoose');
const shortid = require('shortid');
const { Schema } = mongoose;

const groupSchema = new Schema({
  _id: {
    type: String,
    default: shortid.generate
  },
  name: {
    type: String,
    trim: true,
    minlength: 4,
    maxlength: 50
  },
  teacherId: String,
  attendance_record: {
    number: { type: Number, default: 0 },
    details: [{ _id: String, teacherId: String, date: String }]
  },
  students: {
    number: { type: Number, default: 0 },
    details: [{ _id: String, name: String }]
  },
  date: {
    type: Date,
    default: Date.now
  }
});

exports.groupCollection = mongoose.model('Group', groupSchema);