const express = require('express');
const router = express.Router();

const { GroupService } = require('./service');
const groupService = new GroupService();

// creating group
router.post('/create_group', createGroupHandler);

async function createGroupHandler(req, res) {
  const token = req.headers['x-auth-token'];
  const code = await groupService.createGroup(req.body, token);
  res.json(code);
}

module.exports = router;
