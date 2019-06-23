const Joi = require('joi');

function register(user) {
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

function changeProfile(user) {
  const schema = {
    phone: Joi.string()
      .regex(/^\+?[0-9]+/)
      .min(11)
      .max(13),
    name: Joi.string()
      .min(4)
      .max(255),
    email: Joi.string().email({ minDomainAtoms: 2 }),
    password: Joi.string()
      .min(6)
      .max(255)
  };
  return Joi.validate(user, schema);
}

exports.register = register;
exports.changeProfile = changeProfile;
