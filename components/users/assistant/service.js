const { assistantCollection } = require('./model');
const schema = require('./schema');
const middleware = require('./middleware');

const { userCollection } = require('../model');
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

  async getProfile(token) {
    const assistantId = middleware.authorize(token);
    const assistant = await assistantCollection.findById(assistantId);
    if (!assistant) throw new generalErrorHandler.InvalidToken();

    const assistantUser = await userCollection.findById(assistantId);
    return { ...assistant._doc, email: assistantUser.email };
  }

  async changeProfile(body, token) {
    const assistantId = middleware.authorize(token);
    const assistant = await assistantCollection.findById(assistantId);

    if (!assistant) throw new generalErrorHandler.InvalidToken();

    const assistantUser = await userCollection.findById(assistantId);

    const { error } = schema.changeProfile(body);
    if (error) throw new generalErrorHandler.ValidationError(error.details[0].message);

    for (let property in body) {
      switch (property) {
        case 'email':
          assistantUser.email = body.email;
          break;
        case 'password':
          assistantUser.password = await assistantUser.hashPassword(body.password);
          break;
        default:
          assistant[property] = body[property];
      }
    }

    await assistant.save();
    await assistantUser.save();
    return { ...assistant._doc, email: assistantUser.email };
  }
}

exports.AssistantService = AssistantService;
