const express = require('express');
const router = express.Router();

const { AssistantService } = require('./service');
const assistantService = new AssistantService();

router.get('/profile', getProfileHandler);
router.post('/profile', changeProfileHandler);

async function getProfileHandler(req, res) {
  const token = req.headers['x-auth-token'];
  const assistant = await assistantService.getProfile(token);
  res.json(assistant);
}

async function changeProfileHandler(req, res) {
  const token = req.headers['x-auth-token'];
  const assistant = await assistantService.changeProfile(req.body, token);
  res.json(assistant);
}

module.exports = router;
