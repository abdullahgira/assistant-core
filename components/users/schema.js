const Joi = require('joi');

function validateRegister(user) {
  const schema = {
    email: Joi.string()
      .email({ minDomainAtoms: 2 })
      .required(),
    role: Joi.string()
      .valid('student', 'teacher', 'assistant')
      .required(),
    password: Joi.string()
      .min(8)
      .max(255)
      .required(),
    // for teacher, assistant and student register
    name: Joi.string(),
    phone: Joi.string(),
    subject: Joi.string()
  };
  return Joi.validate(user, schema);
}

function validateLogin(req) {
  const schema = {
    email: Joi.string()
      .email({ minDomainAtoms: 2 })
      .required(),
    password: Joi.string()
      .min(6)
      .max(255)
      .required()
  };
  return Joi.validate(req, schema);
}

exports.validateRegister = validateRegister;
exports.validateLogin = validateLogin;
