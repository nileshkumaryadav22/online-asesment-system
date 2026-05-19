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

    const wandboxCompilers = {
      javascript: 'nodejs-20.17.0',
      python: 'cpython-3.14.0',
      java: 'openjdk-jdk-22+36',
      cpp: 'gcc-13.2.0'
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
        const compiler = wandboxCompilers[question.language] || wandboxCompilers.javascript;
        
        if (!question.testCases || question.testCases.length === 0) {
          // No test cases, but let's do a syntax check via Wandbox API!
          try {
            const res = await fetch('https://wandbox.org/api/compile.json', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                compiler: compiler,
                code: ans.codeResponse || '',
                stdin: ''
              })
            });
            const data = await res.json();
            
            // Wandbox returns status "0" for success, anything else (like "1") is an error
            if (data.status !== '0') {
              marksObtained = 0; // Syntax error = 0 marks
            } else {
              // Compiled successfully, fallback to keyword evaluation
              marksObtained = evaluateDescriptiveAnswer(ans.codeResponse, question.keywords || [], question.marks);
            }
          } catch (err) {
            console.error('Wandbox Syntax Check Error:', err);
            marksObtained = evaluateDescriptiveAnswer(ans.codeResponse, question.keywords || [], question.marks);
          }
        } else {
          // Evaluate against test cases
          let passedCases = 0;
          for (const tc of question.testCases) {
            try {
              const res = await fetch('https://wandbox.org/api/compile.json', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  compiler: compiler,
                  code: ans.codeResponse || '',
                  stdin: tc.input || ''
                })
              });
              const data = await res.json();
              if (data.status === '0' && data.program_output !== undefined) {
                const actualOutput = data.program_output.trim();
                if (actualOutput === tc.expectedOutput.trim()) {
                  passedCases++;
                }
              }
            } catch (err) {
              console.error('Wandbox Execution Error:', err);
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
