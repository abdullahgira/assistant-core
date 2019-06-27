const Joi = require('joi');

function addScore(body) {
  const schema = {
    score: Joi.number().required()
  };
  return Joi.validate(body, schema);
}

function setMaxAndRedoScores(body) {
  const schema = {
    score: Joi.number().required()
  };
  return Joi.validate(body, schema);
}

exports.addScore = addScore;
exports.setMaxAndRedoScores = setMaxAndRedoScores;
