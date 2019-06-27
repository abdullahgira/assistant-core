class InvalidBody extends Error {
  constructor(message) {
    super(message);
    this.name = 'InvalidScoreValue';
    this.statusCode = 406;
  }
}

class InvalidScoreValue extends Error {
  constructor(message) {
    super(message);
    this.name = 'InvalidScoreValue';
    this.statusCode = 400;
  }
}

class InvalidType extends Error {
  constructor(message) {
    super(message);
    this.name = 'InvalidType';
    this.statusCode = 400;
  }
}

exports.InvalidBody = InvalidBody;
exports.InvalidScoreValue = InvalidScoreValue;
exports.InvalidType = InvalidType;
