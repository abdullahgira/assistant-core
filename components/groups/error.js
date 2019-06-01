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

class Forbidden extends Error {
  constructor(message = 'Forbidden access to a group that doesn\'t relate to the teacher.') {
    super(message);
    this.name = 'InvalidGroupId';
    this.statusCode = 406;
  }
}

class StudentHasRecordedAttendance extends Error {
  constructor(message = 'The student has already been recorded in the attendance.') {
    super(message);
    this.name = 'StudentMaxAttedanceRecorded';
    this.statusCode = 405;
  }
}

exports.GroupCreationError = GroupCreationError;
exports.InvalidGroupId = InvalidGroupId;
exports.DoublicateEntry = DoublicateEntry;
exports.Forbidden = Forbidden;
exports.StudentHasRecordedAttendance = StudentHasRecordedAttendance;
