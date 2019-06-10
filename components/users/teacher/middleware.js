const jwt = require('jsonwebtoken');
const config = require('config');
const generalErrorHandler = require('../error');

exports.authorize = function(token) {
  const decoded = jwt.verify(token, config.get('jwtPrivateKey'));
  if (decoded.role !== 'teacher') throw new generalErrorHandler.Forbidden();

  return decoded._id;
};
