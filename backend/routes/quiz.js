const express = require('express');
const { createQuiz, getQuizzes, getQuizById, getAdminQuizzes } = require('../controllers/quizController');
const { protect, admin } = require('../middleware/auth');
const router = express.Router();

router.route('/')
  .post(protect, admin, createQuiz)
  .get(protect, getQuizzes);

router.get('/admin', protect, admin, getAdminQuizzes);
router.get('/:id', protect, getQuizById);

module.exports = router;
