const express = require('express');
const { createQuiz, getQuizzes, getQuizById, getAdminQuizzes, deleteQuiz } = require('../controllers/quizController');
const { protect, admin } = require('../middleware/auth');
const router = express.Router();

router.route('/')
  .post(protect, admin, createQuiz)
  .get(protect, getQuizzes);

router.get('/admin', protect, admin, getAdminQuizzes);
router.route('/:id')
  .get(protect, getQuizById)
  .delete(protect, admin, deleteQuiz);

module.exports = router;
