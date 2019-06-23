const express = require('express');
const router = express.Router();

const { PostService } = require('./service');
const postService = new PostService();

router.post('/create_post', createPublicPostHandler);

async function createPublicPostHandler(req, res) {
  const token = req.headers['x-auth-token'];
  const post = await postService.createPublicPost(req.body, token);
  res.json(post);
}

module.exports = router;
