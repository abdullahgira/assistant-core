const mongoose = require('mongoose');
const shortid = require('shortid');
const { Schema } = mongoose;

const postSchema = new Schema({
  _id: {
    type: String,
    default: shortid.generate
  },
  title: {
    type: String,
    trim: true,
    minlength: 10,
    maxlength: 100
  },
  content: {
    type: String,
    trim: true,
    minlength: 50,
    maxlength: 1500
  },
  teacher: { _id: String, name: String },
  groupId: String,
  role: {
    type: String,
    enum: ['public', 'private']
  },
  date: {
    type: Date,
    default: Date.now
  }
});

exports.postCollection = mongoose.model('Post', postSchema);
