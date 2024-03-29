const mongoose = require('mongoose');
const shortid = require('shortid');
const { Schema } = mongoose;

const assistantSchema = new Schema({
  _id: {
    type: String,
    default: shortid.generate
  },
  name: {
    type: String,
    trim: true,
    minlength: 3,
    maxlength: 50
  },
  phone: {
    type: String,
    default: ''
  },
  teacherId: String,
  date: {
    type: Date,
    default: Date.now
  },
  recentlyVerified: Date
});

exports.assistantCollection = mongoose.model('Assistant', assistantSchema);
