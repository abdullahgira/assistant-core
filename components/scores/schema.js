const Joi = require('joi');

function addScore(body) {
  const schema = {
    score: Joi.number()
      .min(0)
      .required()
  };
  return Joi.validate(body, schema);
}

function setMaxScores(body) {
  const schema = {
    score: Joi.number()
      .min(1)
      .required()
  };
  return Joi.validate(body, schema);
}

function setRedoScores(body) {
  const schema = {
    score: Joi.number()
      .min(0)
      .required()
  };
  return Joi.validate(body, schema);
}

exports.addScore = addScore;
exports.setMaxScores = setMaxScores;
exports.setRedoScores = setRedoScores;
