const express = require('express');
const router = express.Router();

const { ScoreService } = require('./service');
const scoreService = new ScoreService();

router.post('/add_score/student_:studentId', addScoreHandler);

async function addScoreHandler(req, res) {
  const token = req.headers['x-auth-token'];
  const newScore = await scoreService.addScore(token, req.params.studentId, req.body);
  res.json(newScore);
}

module.exports = router;
