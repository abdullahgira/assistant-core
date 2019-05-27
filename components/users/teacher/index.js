const express = require('express');
const router = express.Router();

const { TeacherService } = require('./service');
const teacherService = new TeacherService();

// Adding assistant
router.post('/assistant', addAssistantHandler);

async function addAssistantHandler(req, res) {
  const token = req.headers['x-auth-token'];
  const code = await teacherService.addAssistant(req.body, token);
  res.json(code);
}

module.exports = router;
