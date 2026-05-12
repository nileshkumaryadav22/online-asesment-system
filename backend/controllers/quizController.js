const Quiz = require('../models/Quiz');
const Attempt = require('../models/Attempt');

exports.createQuiz = async (req, res) => {
  try {
    const { title, description, duration, questions } = req.body;
    const quiz = new Quiz({
      title,
      description,
      duration,
      questions,
      createdBy: req.user._id
    });
    const savedQuiz = await quiz.save();
    res.status(201).json(savedQuiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ isActive: true }).select('-questions.correctOption -questions.keywords');
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    
    // If student, don't send correct options and keywords
    if (req.user.role === 'student') {
      const studentQuiz = quiz.toObject();
      studentQuiz.questions.forEach(q => {
        delete q.correctOption;
        delete q.keywords;
      });
      return res.json(studentQuiz);
    }
    
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAdminQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ createdBy: req.user._id });
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    
    // Check if user is the creator
    if (quiz.createdBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to delete this quiz' });
    }

    await Quiz.findByIdAndDelete(req.params.id);
    res.json({ message: 'Quiz removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getQuizLeaderboard = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    if (req.user.role === 'student' && !quiz.leaderboardPublished) {
      return res.status(403).json({ message: 'Leaderboard is not published yet' });
    }

    const attempts = await Attempt.find({ quizId: req.params.id, status: 'submitted' })
      .populate('studentId', 'name email')
      .sort({ totalMarksObtained: -1 });

    res.json({
      quizTitle: quiz.title,
      isPublished: quiz.leaderboardPublished,
      leaderboard: attempts.map(attempt => ({
        id: attempt._id,
        studentName: attempt.studentId.name,
        studentEmail: attempt.studentId.email,
        score: attempt.totalMarksObtained,
        submittedAt: attempt.endTime
      }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.publishLeaderboard = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    
    if (quiz.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    quiz.leaderboardPublished = true;
    await quiz.save();

    res.json({ message: 'Leaderboard published successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

