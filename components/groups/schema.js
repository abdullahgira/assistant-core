const Joi = require('joi');

function createGroup(body) {
  const schema = {
    name: Joi.string()
      .min(4)
      .max(50)
      .required(),
    day: Joi.string()
      .valid('sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri')
      .required()
  };
  return Joi.validate(body, schema);
}

function addStudent(body) {
  const schema = {
    name: Joi.string()
      .min(4)
      .max(50)
      .required(),
    phone: Joi.string()
      .regex(/^\+?[0-9]+/)
      .min(11)
      .max(13),
    parentPhone: Joi.string()
      .regex(/^\+?[0-9]+/)
      .min(11)
      .max(13),
    address: Joi.string()
      .min(3)
      .max(150),
    studentNumber: Joi.string().max(20)
  };
  return Joi.validate(body, schema);
}

function editStudent(body) {
  const schema = {
    name: Joi.string()
      .min(4)
      .max(50),
    phone: Joi.string()
      .regex(/^\+?[0-9]+/)
      .min(11)
      .max(13),
    parentPhone: Joi.string()
      .regex(/^\+?[0-9]+/)
      .min(11)
      .max(13),
    address: Joi.string()
      .min(3)
      .max(150),
    studentNumber: Joi.string().max(20)
  };
  return Joi.validate(body, schema);
}

function paymentAmount(body) {
  const schema = {
    amount: Joi.number().required()
  };
  return Joi.validate(body, schema);
}

function nAttendancesPerMonth(body) {
  const schema = {
    number: Joi.number()
      .min(1)
      .max(8)
      .required()
  };
  return Joi.validate(body, schema);
}

function setWeekStart(body) {
  const schema = {
    day: Joi.string()
      .valid('sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri')
      .required()
  };
  return Joi.validate(body, schema);
}

exports.createGroup = createGroup;
exports.addStudent = addStudent;
exports.editStudent = editStudent;
exports.paymentAmount = paymentAmount;
exports.nAttendancesPerMonth = nAttendancesPerMonth;
exports.setWeekStart = setWeekStart;
