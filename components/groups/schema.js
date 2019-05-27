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

exports.createGroup = createGroup;
