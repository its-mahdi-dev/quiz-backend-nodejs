const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const answerController = require('../controllers/answerController');

router.get('/questions', questionController.getPlayerQuestions);
router.get('/questions/random', questionController.getRandomQuestion);
router.get('/questions/:question_id', questionController.getSingleQuqestion);
router.post('/questions/:question_id', answerController.submitPlayerAnswer);
router.get('/scores', questionController.getPlayersQuestion);
module.exports = router;
