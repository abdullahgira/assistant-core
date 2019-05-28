class GroupCreationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'GroupCreationError';
    this.statusCode = 406;
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
