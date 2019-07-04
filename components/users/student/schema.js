const Joi = require('joi');

function register(user) {
  const schema = {
    name: Joi.string()
      .min(4)
      .max(255)
      .required(),
    phone: Joi.string()
      .regex(/^\+?[0-9]+/)
      .min(11)
      .max(13)
      .required(),
    address: Joi.string()
      .min(10)
      .max(150)
      .required(),
    age: Joi.number()
      .min(15)
      .max(20),
    // for user collection
    email: Joi.string(),
    role: Joi.string(),
    password: Joi.string()
  };
  return Joi.validate(user, schema);
}

function joinTeacher(body) {
  const schema = {
    code: Joi.string()
      .min(6)
      .max(25)
      .required()
  };
  return Joi.validate(body, schema);
}

exports.register = register;
exports.joinTeacher = joinTeacher;
