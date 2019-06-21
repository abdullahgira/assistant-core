const { postCollection } = require('./model');
const validator = require('./validator');

const assistantMiddleware = require('../users/assistant/middleware');
const { teacherCollection } = require('../users/teacher/model');

class PostService {
  async createPublicPost(body, token) {
    const assistantId = assistantMiddleware.authorize(token);

    const assistant = validator.validateAssistantExistence(assistantId);
    validator.validateCreatePost(body);

    const teacher = await teacherCollection.findById(assistant.teacherId);
    const post = new postCollection({
      title: body.title,
      content: body.content
    });

    console.log(teacher.posts);
    teacher.posts || (teacher.posts = { number: 0, details: [] });

    teacher.posts.number++;
    teacher.posts.details.push({ _id: post._id, title: post.title });

    await teacher.save();
    await post.save();

    return post;
  }
}

exports.PostService = PostService;
