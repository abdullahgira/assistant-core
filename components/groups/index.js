const express = require('express');
const router = express.Router();

const { GroupService } = require('./service');
const groupService = new GroupService();

router.post('/create_group', createGroupHandler);
router.post('/group_:id/add_student', addStudentHandler);

async function createGroupHandler(req, res) {
  const token = req.headers['x-auth-token'];
  const group = await groupService.createGroup(req.body, token);
  res.json(group);
}

async function addStudentHandler(req, res) {
  const token = req.headers['x-auth-token'];
  const code = await groupService.addStudent(req.body, token, req.params.id);
  res.json(code);
}

module.exports = router;
