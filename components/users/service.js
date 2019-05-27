const generalErrorHandler = require('./error');

const { userCollection } = require('./model');
const { validateRegister, validateLogin } = require('./schema');

// const { teacherCollection } = require('./teacher/model');
const { TeacherService } = require('./teacher/service');

class UserService {
  async register(body) {
    /**
     * @param body -> request body
     *
     * Register all users (teacher, assistant & student) from this service.
     *
     * It searches for a role property in the request body and determines which
     * service from the imported is responsible for handling the request,
     * then all users are saved in allUsers db for managing unique emails, and
     * for faster login and register.
     */

    const { error } = validateRegister(body);
    if (error) throw new generalErrorHandler.ValidationError(error.details[0].message);

    const isDuplicateEmail = await userCollection.findOne({ email: body.email });
    if (isDuplicateEmail) throw new generalErrorHandler.InvalidCredentials('Email is already registered');

    let user;
    switch (body.role) {
      case 'teacher':
        user = await TeacherService.register(body);
        break;
    }

    const allUsers = new userCollection({
      _id: user._id,
      email: body.email,
      role: body.role
    });

    allUsers.password = await allUsers.hashPassword(body.password);

    await user.save();
    await allUsers.save();

    return user;
  }

  async login(body) {
    const { error } = validateLogin(body);
    if (error) throw new generalErrorHandler.ValidationError(error.details[0].message);

    // finding email address
    const user = await userCollection.findOne({ email: body.email.trim() });
    if (!user) throw new generalErrorHandler.InvalidCredentials();

    // confirming password correcteness
    const isValidPassword = await user.validatePassword(body.password, user.password);
    if (!isValidPassword) throw new generalErrorHandler.InvalidCredentials();

    return user;
  }
}

exports.UserService = UserService;
