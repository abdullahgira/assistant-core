const express = require('express');
const router = express.Router();

const { ScoreService } = require('./service');
const scoreService = new ScoreService();

router.get('/group_:groupId', scoresDatesHandler);
router.get('/student_:studentId', getScoresForStudentHandler);
router.get('/group_:groupId/students', getScoresBasedOnDateHandler);

router.get('/group_:groupId/set_new_score_record', setNewScoreRecordHandler);

router.post('/set_score', setScoreHandler);
router.get('/get_score_info', getScoreHandler);

router.post('/add_score/group_:groupId/student_:studentId', addScoreHandler);
router.post('/edit_score/group_:groupId/student_:studentId/score_:scoreId', editScoreHandler);

router.delete('/delete_score/group_:groupId/student_:studentId/score_:scoreId', deleteScoreHandler);

async function getScoresForStudentHandler(req, res) {
  const token = req.headers['x-auth-token'];
  const scores = await scoreService.getScoresForStudent(token, req.params.studentId);
  res.json(scores);
}

async function getScoresBasedOnDateHandler(req, res) {
  const token = req.headers['x-auth-token'];
  const students = req.query.date
    ? await scoreService.getScoresBasedOnDate(token, req.params.groupId, req.query.date)
    : await scoreService.getGroupStudents(token, req.params.groupId);
  res.json(students);
}

async function scoresDatesHandler(req, res) {
  const token = req.headers['x-auth-token'];
  const dates = await scoreService.scoresDates(token, req.params.groupId);
  res.json(dates);
}

async function setNewScoreRecordHandler(req, res) {
  const token = req.headers['x-auth-token'];
  const date = await scoreService.setNewScoreRecord(token, req.params.groupId);
  res.json(date);
}

async function setScoreHandler(req, res) {
  const token = req.headers['x-auth-token'];
  const status = await scoreService.setMaxAndRedoScores(token, req.body, req.query.type);
  res.json(status);
}

async function getScoreHandler(req, res) {
  const token = req.headers['x-auth-token'];
  const score_info = await scoreService.getMaxAndRedoScores(token);
  res.json(score_info);
}

async function addScoreHandler(req, res) {
  const token = req.headers['x-auth-token'];
  const newScore = await scoreService.addScore(token, req.body, req.params.groupId, req.params.studentId);
  res.json(newScore);
}

async function editScoreHandler(req, res) {
  const token = req.headers['x-auth-token'];
  const newScore = await scoreService.editScore(
    token,
    req.body,
    req.params.groupId,
    req.params.studentId,
    req.params.scoreId
  );
  res.json(newScore);
}

async function deleteScoreHandler(req, res) {
  const token = req.headers['x-auth-token'];
  const newScores = await scoreService.deleteScore(
    token,
    req.params.groupId,
    req.params.studentId,
    req.params.scoreId
  );
  res.json(newScores);
}

module.exports = router;
