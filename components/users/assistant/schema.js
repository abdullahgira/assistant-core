const Joi = require('joi');

function validateRegister(user) {
  const schema = {
    name: Joi.string()
      .min(4)
      .max(255)
      .required(),
    phone: Joi.string()
      .min(11)
      .max(13)
      .required(),
    // for user collection
    email: Joi.string(),
    role: Joi.string(),
    password: Joi.string()
  };
  return Joi.validate(user, schema);
}

exports.validateRegister = validateRegister;
