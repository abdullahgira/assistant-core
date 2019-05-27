const Joi = require('joi');

function register(user) {
  const schema = {
    name: Joi.string()
      .min(4)
      .max(255)
      .required(),
    phone: Joi.string()
      .min(11)
      .max(13)
      .required(),
    subject: Joi.string()
      .min(2)
      .max(10)
      .required(),
    // for user collection
    email: Joi.string(),
    role: Joi.string(),
    password: Joi.string()
  };
  return Joi.validate(user, schema);
}

function addAssistant(user) {
  const schema = {
    name: Joi.string()
      .min(4)
      .max(255)
      .required()
  };
  return Joi.validate(user, schema);
}

exports.register = register;
exports.addAssistant = addAssistant;
