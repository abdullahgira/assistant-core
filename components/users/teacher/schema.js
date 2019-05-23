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
  };
  return Joi.validate(user, schema);
}

exports.validateRegister = validateRegister;
