const { assistantCollection } = require('./model');
const schema = require('./schema');
const generalErrorHandler = require('../error');

class AssistantService {
  static async register(body) {
    const { error } = schema.register(body);
    if (error) throw new generalErrorHandler.ValidationError(error.details[0].message);

    const user = await assistantCollection.findById(body.code);
    if (!user) throw new generalErrorHandler.InvalidCredentials('invalid code was provided');

    user.phone = body.phone;

    await user.save();
    return user;
  }
}

exports.AssistantService = AssistantService;
