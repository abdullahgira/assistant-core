const Joi = require('joi');

function createPost(body) {
  const schema = {
    title: Joi.string()
      .min(10)
      .max(100)
      .required(),
    content: Joi.string()
      .min(50)
      .max(1500)
  };
  return Joi.validate(body, schema);
}

exports.createPost = createPost;
