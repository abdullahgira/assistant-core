const express = require('express');
const router = express.Router();

const { UserService } = require('./service');
const userService = new UserService();

// user components
router.use('/teacher', require('./teacher'));
router.use('/assistant', require('./assistant'));
router.use('/student', require('./student'));

router.post('/register', registerHandler);
router.post('/login', loginHandler);

// route handlers
async function registerHandler(req, res) {
  const user = await userService.register(req.body);
  res.json(user);
}

async function loginHandler(req, res) {
  const user = await userService.login(req.body);
  res.set('x-auth-token', user.generateAuthToken());
  res.json({ name: user.name, email: user.email });
}

module.exports = router;
