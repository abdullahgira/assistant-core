const shortid = require('shortid');
const mongoose = require('mongoose');
const { Schema } = mongoose;

const studentSchema = new Schema({
  _id: {
    type: String,
    default: shortid.generate
  },
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 255
  },
  phone: { type: String, required: true },
  age: { type: Number, required: true },
  address: { type: String, required: true },
  teachers: {
    number: { type: Number, default: 0 },
    details: [{ _id: String, name: String, groupId: String, studentTeacherId: String }]
  }
});

exports.studentCollection = mongoose.model('Student', studentSchema);
