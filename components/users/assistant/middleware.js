const jwt = require('jsonwebtoken');
const generalErrorHandler = require('../error');

exports.authorize = function(token) {
  const decoded = jwt.verify(token, 'SecureKey');
  if (decoded.role !== 'assistant') throw new generalErrorHandler.Forbidden();

  return decoded._id;
};
