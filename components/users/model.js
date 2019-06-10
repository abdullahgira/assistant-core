const config = require('config');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const shortid = require('shortid');
const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  _id: {
    type: String,
    default: shortid.generate
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    maxlength: 255
  },
  role: {
    type: String,
    enum: ['student', 'teacher', 'assistant']
  },
  date: {
    type: Date,
    default: Date.now
  },
  isAdmin: {
    type: Boolean,
    default: false
  }
});

userSchema.methods.hashPassword = async password => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

userSchema.methods.validatePassword = async (passedPassword, password) => {
  return await bcrypt.compare(passedPassword, password);
};

userSchema.methods.generateAuthToken = function() {
  return jwt.sign({ _id: this._id, isAdmin: this.isAdmin, role: this.role }, config.get('jwtPrivateKey'));
};

exports.userCollection = mongoose.model('User', userSchema);
