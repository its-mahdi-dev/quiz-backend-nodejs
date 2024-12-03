const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const answerController = require('../controllers/answerController');
const categoryController = require('../controllers/categoryController');

router.get('/questions', questionController.getDesignerQuestion);
router.post('/questions', questionController.addQuestion);
router.get('/categories', categoryController.getCategories);
router.post('/categories', categoryController.addCategory);
module.exports = router;
