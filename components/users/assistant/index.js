const express = require('express');
const router = express.Router();

const { AssistantService } = require('./service');
const assistantService = new AssistantService();

router.get('/profile', getProfileHandler);

async function getProfileHandler(req, res) {
  const token = req.headers['x-auth-token'];
  const assistant = await assistantService.getProfile(token);
  res.json(assistant);
}

module.exports = router;
