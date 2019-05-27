const Joi = require('joi');

function validateRegister(user) {
  const schema = {
    phone: Joi.string()
      .min(11)
      .max(13)
      .required(),
    code: Joi.string().max(11),
    // for user collection
    email: Joi.string(),
    role: Joi.string(),
    password: Joi.string()
  };
  return Joi.validate(user, schema);
}

exports.validateRegister = validateRegister;
