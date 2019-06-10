const jwt = require('jsonwebtoken');
const config = require('config');
const generalErrorHandler = require('../error');

exports.authorize = function(token) {
  if (!token) throw new generalErrorHandler.NoTokenProvided();

  const decoded = jwt.verify(token, config.get('jwtPrivateKey'));
  if (decoded.role !== 'assistant') throw new generalErrorHandler.Forbidden();

  return decoded._id;
};
