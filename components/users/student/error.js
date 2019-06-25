class DoublicateEntry extends Error {
  constructor(message = 'You already joined this teacher') {
    super(message);
    this.name = 'DoublicateEntry';
    this.statusCode = 400;
  }
}

exports.DoublicateEntry = DoublicateEntry;
