const express = require('express');
const router = express.Router();

const { ScoreService } = require('./service');
const scoreService = new ScoreService();

// router.get();

router.post('/set_score', setScoreHandler);
router.post('/add_score/student_:studentId', addScoreHandler);
router.post('/edit_score/score_:scoreId/student_:studentId', editScoreHandler);

router.delete('/delete_score/score_:scoreId/student_:studentId', deleteScoreHandler);

async function setScoreHandler(req, res) {
  const token = req.headers['x-auth-token'];
  const status = await scoreService.setMaxAndRedoScores(token, req.body, req.query.type);
  res.json(status);
}

async function addScoreHandler(req, res) {
  const token = req.headers['x-auth-token'];
  const newScore = await scoreService.addOrEditScore(token, req.body, req.params.studentId);
  res.json(newScore);
}

async function editScoreHandler(req, res) {
  const token = req.headers['x-auth-token'];
  const newScore = await scoreService.addOrEditScore(
    token,
    req.body,
    req.params.studentId,
    req.params.scoreId
  );
  res.json(newScore);
}

async function deleteScoreHandler(req, res) {
  const token = req.headers['x-auth-token'];
  const newScores = await scoreService.deleteScore(token, req.params.studentId, req.params.scoreId);
  res.json(newScores);
}

module.exports = router;
