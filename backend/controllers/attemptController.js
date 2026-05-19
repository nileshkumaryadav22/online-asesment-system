const Attempt = require('../models/Attempt');
const Quiz = require('../models/Quiz');
const { evaluateDescriptiveAnswer } = require('../services/evaluationService');

exports.startAttempt = async (req, res) => {
  try {
    const quizId = req.body.quizId;
    const existingAttempt = await Attempt.findOne({ quizId, studentId: req.user._id, status: 'in-progress' });
    
    if (existingAttempt) {
      return res.json(existingAttempt);
    }

    const attempt = new Attempt({
      quizId,
      studentId: req.user._id,
      answers: []
    });
    
    await attempt.save();
    res.status(201).json(attempt);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.submitAttempt = async (req, res) => {
  try {
    const attemptId = req.params.id;
    const { answers } = req.body;
    
    const attempt = await Attempt.findById(attemptId);
    if (!attempt) return res.status(404).json({ message: 'Attempt not found' });
    if (attempt.status === 'submitted') return res.status(400).json({ message: 'Already submitted' });

    const quiz = await Quiz.findById(attempt.quizId);
    let totalMarks = 0;

    const evaluatedAnswers = answers.map(ans => {
      const question = quiz.questions.id(ans.questionId);
      let marksObtained = 0;

      if (ans.type === 'mcq') {
        if (ans.selectedOption === question.correctOption) {
          marksObtained = question.marks;
        }
      } else if (ans.type === 'descriptive') {
        marksObtained = evaluateDescriptiveAnswer(ans.textResponse, question.keywords, question.marks);
      } else if (ans.type === 'coding') {
        marksObtained = evaluateDescriptiveAnswer(ans.codeResponse, question.keywords || [], question.marks);
      }

      totalMarks += marksObtained;

      return {
        ...ans,
        marksObtained,
        evaluated: true
      };
    });

    attempt.answers = evaluatedAnswers;
    attempt.totalMarksObtained = totalMarks;
    attempt.status = 'submitted';
    attempt.endTime = Date.now();

    await attempt.save();
    res.json(attempt);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAttemptResult = async (req, res) => {
  try {
    const attempt = await Attempt.findById(req.params.id).populate('quizId');
    if (!attempt) return res.status(404).json({ message: 'Attempt not found' });
    
    // Check if user is the student who made attempt or an admin
    if (req.user.role === 'student' && attempt.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    res.json(attempt);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
