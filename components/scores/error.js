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

class DuplicateScores extends Error {
  constructor(message = 'Score of that day has already been added') {
    super(message);
    this.name = 'DuplicateScores';
    this.statusCode = 409;
  }
}

class StudentHasNotAttendedLastGroupAttendance extends Error {
  constructor(message = 'The student has not recorded the last group attendance') {
    super(message);
    this.name = 'StudentHasNotAttendedLastGroupAttendance';
    this.statusCode = 405;
  }
}

class GroupHasNoScoreRecord extends Error {
  constructor(message = 'The group has not recorded any attendance') {
    super(message);
    this.name = 'GroupHasNoScoreRecord';
    this.statusCode = 400;
  }
}

class InvalidScoreId extends Error {
  constructor(message = 'Score is not available') {
    super(message);
    this.name = 'InvalidScoreId';
    this.statusCode = 400;
  }
}

exports.InvalidBody = InvalidBody;
exports.InvalidScoreValue = InvalidScoreValue;
exports.InvalidType = InvalidType;
exports.InvalidScoreId = InvalidScoreId;
exports.StudentHasNotAttendedLastGroupAttendance = StudentHasNotAttendedLastGroupAttendance;
exports.GroupHasNoScoreRecord = GroupHasNoScoreRecord;
exports.DuplicateScores = DuplicateScores;
