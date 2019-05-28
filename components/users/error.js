class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 406;
  }
}

class InvalidCredentials extends Error {
  constructor(message = 'Invalid email or password') {
    super(message);
    this.name = 'InvalidCredentials';
    this.statusCode = 400;
  }
}

class NoTokenProvided extends Error {
  constructor(message = 'Access denied. No token provided') {
    super(message);
    this.name = 'InvalidToken';
    this.statusCode = 401;
  }
}

class InvalidToken extends Error {
  constructor(message = 'Invalid token was provided') {
    super(message);
    this.name = 'InvalidToken';
    this.statusCode = 400;
  }
}

class InvalidUserId extends Error {
  constructor(message = 'Invalid id was provided') {
    super(message);
    this.name = 'InvalidUserId';
    this.statusCode = 400;
  }
}

class Forbidden extends Error {
  constructor(message = 'An un authorized action occured') {
    super(message);
    this.name = 'Forbidden';
    this.statusCode = 401;
  }
}

exports.ValidationError = ValidationError;
exports.InvalidCredentials = InvalidCredentials;
exports.InvalidToken = InvalidToken;
exports.InvalidUserId = InvalidUserId;
exports.NoTokenProvided = NoTokenProvided;
exports.Forbidden = Forbidden;
