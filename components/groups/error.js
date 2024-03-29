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

class GroupHasNoAttendanceRecord extends Error {
  constructor(message = 'Group has no attendance record') {
    super(message);
    this.name = 'GroupHasNoAttendanceRecord';
    this.statusCode = 400;
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

class ReachedMaxReversePayValue extends Error {
  constructor(message = 'Maximum return value has been reached') {
    super(message);
    this.name = 'ReachedMaxReversePayValue';
    this.statusCode = 405;
  }
}

class InvalidPaidAmount extends Error {
  constructor(message = 'Invalid amount was given, only amounts that are bigger than 0 are accepted') {
    super(message);
    this.name = 'InvalidPaidAmount';
    this.statusCode = 405;
  }
}

class InvalidPaymentType extends Error {
  constructor(message = 'Invalid type was given, only "amount" and "attendance" are available') {
    super(message);
    this.name = 'InvalidPaidAmount';
    this.statusCode = 405;
  }
}

class PaymentAmountIsUnknown extends Error {
  constructor(message) {
    super(message);
    this.name = 'BooksPaymentIsUnknown';
    this.statusCode = 405;
  }
}

class PaymentIsAlreadyPaid extends Error {
  constructor(message) {
    super(message);
    this.name = 'BooksPaymentIsUnknown';
    this.statusCode = 405;
  }
}

class NotAllowed extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotAllowed';
    this.statusCode = 405;
  }
}

class StudentIsNotInGroup extends Error {
  constructor(message = 'Student is not in the group') {
    super(message);
    this.name = 'StudentIsNotInGroup';
    this.statusCode = 400;
  }
}

exports.GroupCreationError = GroupCreationError;
exports.InvalidGroupId = InvalidGroupId;
exports.DoublicateEntry = DoublicateEntry;
exports.Forbidden = Forbidden;
exports.StudentHasRecordedAttendance = StudentHasRecordedAttendance;
exports.ReachedMaxReversePayValue = ReachedMaxReversePayValue;
exports.InvalidPaidAmount = InvalidPaidAmount;
exports.InvalidPaymentType = InvalidPaymentType;
exports.PaymentAmountIsUnknown = PaymentAmountIsUnknown;
exports.PaymentIsAlreadyPaid = PaymentIsAlreadyPaid;
exports.NotAllowed = NotAllowed;
exports.StudentIsNotInGroup = StudentIsNotInGroup;
exports.GroupHasNoAttendanceRecord = GroupHasNoAttendanceRecord;
