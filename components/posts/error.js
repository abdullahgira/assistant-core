class PostCreationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'PostCreationError';
    this.statusCode = 406;
  }
}

exports.PostCreationError = PostCreationError;
