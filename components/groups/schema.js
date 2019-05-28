const Joi = require('joi');

function createGroup(body) {
  const schema = {
    name: Joi.string()
      .min(4)
      .max(50)
      .required()
  };
  return Joi.validate(body, schema);
}

function addStudent(body) {
  const schema = {
    name: Joi.string()
      .min(4)
      .max(50)
      .required(),
    phone: Joi.string()
      .min(11)
      .max(13)
      .required()
  };
  return Joi.validate(body, schema);
}

exports.createGroup = createGroup;
exports.addStudent = addStudent;
