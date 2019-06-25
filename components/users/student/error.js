class DoublicateEntry extends Error {
  constructor(message = 'You already joined this teacher') {
    super(message);
    this.name = 'DoublicateEntry';
    this.statusCode = 400;
  }
}

class StudentHasRecordedAttendance extends Error {
  constructor(message = 'The student has already been recorded in the attendance.') {
    super(message);
    this.name = 'StudentMaxAttedanceRecorded';
    this.statusCode = 405;
  }
}

class InvalidAttendanceId extends Error {
  constructor(message = 'Invalid attendance id') {
    super(message);
    this.name = 'InvalidAttendanceId';
    this.statusCode = 400;
  }
}

exports.DoublicateEntry = DoublicateEntry;
exports.StudentHasRecordedAttendance = StudentHasRecordedAttendance;
exports.InvalidAttendanceId = InvalidAttendanceId;
