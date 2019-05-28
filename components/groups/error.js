class GroupCreationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'GroupCreationError';
    this.statusCode = 406;
  }
}

class DoublicateEntry extends Error {
  constructor(message = 'This name is already added.') {
    super(message);
    this.name = 'DoublicateEntry';
    this.statusCode = 400;
  }
}

class InvalidGroupId extends Error {
  constructor(message = 'Invalid group id was provided') {
    super(message);
    this.name = 'InvalidGroupId';
    this.statusCode = 406;
  }
}

exports.GroupCreationError = GroupCreationError;
exports.InvalidGroupId = InvalidGroupId;
exports.DoublicateEntry = DoublicateEntry;
