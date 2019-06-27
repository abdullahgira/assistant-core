const express = require('express');
const router = express.Router();

const { ScoreService } = require('./service');
const scoreService = new ScoreService();

router.post('/set_score', setScoreHandler);
router.post('/add_score/student_:studentId', addScoreHandler);

async function setScoreHandler(req, res) {
  const token = req.headers['x-auth-token'];
  const status = await scoreService.setMaxAndRedoScores(token, req.body, req.query.type);
  res.json(status);
}

async function addScoreHandler(req, res) {
  const token = req.headers['x-auth-token'];
  const newScore = await scoreService.addScore(token, req.params.studentId, req.body);
  res.json(newScore);
}

module.exports = router;
