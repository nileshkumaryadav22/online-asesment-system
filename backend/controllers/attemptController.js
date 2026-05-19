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

    const pistonRuntimes = {
      javascript: { language: 'javascript', version: '18.15.0' },
      python: { language: 'python', version: '3.10.0' },
      java: { language: 'java', version: '15.0.2' },
      cpp: { language: 'c++', version: '10.2.0' }
    };

    const evaluatedAnswers = await Promise.all(answers.map(async (ans) => {
      const question = quiz.questions.id(ans.questionId);
      let marksObtained = 0;

      if (ans.type === 'mcq') {
        if (ans.selectedOption === question.correctOption) {
          marksObtained = question.marks;
        }
      } else if (ans.type === 'descriptive') {
        marksObtained = evaluateDescriptiveAnswer(ans.textResponse, question.keywords, question.marks);
      } else if (ans.type === 'coding') {
        if (!question.testCases || question.testCases.length === 0) {
          marksObtained = evaluateDescriptiveAnswer(ans.codeResponse, question.keywords || [], question.marks);
        } else {
          let passedCases = 0;
          const runtime = pistonRuntimes[question.language] || pistonRuntimes.javascript;
          
          for (const tc of question.testCases) {
            try {
              const res = await fetch('https://emkc.org/api/v2/piston/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  language: runtime.language,
                  version: runtime.version,
                  files: [{ name: `main.${question.language}`, content: ans.codeResponse || '' }],
                  stdin: tc.input || ''
                })
              });
              const data = await res.json();
              if (data.run && data.run.stdout) {
                const actualOutput = data.run.stdout.trim();
                if (actualOutput === tc.expectedOutput.trim()) {
                  passedCases++;
                }
              }
            } catch (err) {
              console.error('Piston Execution Error:', err);
            }
          }
          marksObtained = (passedCases / question.testCases.length) * question.marks;
          marksObtained = Math.round(marksObtained * 10) / 10;
        }
      }

      totalMarks += marksObtained;

      return {
        ...ans,
        marksObtained,
        evaluated: true
      };
    }));

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
