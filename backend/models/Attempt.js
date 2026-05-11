const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
  type: { type: String, enum: ['mcq', 'descriptive'], required: true },
  selectedOption: { type: Number }, // For MCQ
  textResponse: { type: String }, // For Descriptive
  marksObtained: { type: Number, default: 0 },
  evaluated: { type: Boolean, default: false }
});

const attemptSchema = new mongoose.Schema({
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date },
  status: { type: String, enum: ['in-progress', 'submitted'], default: 'in-progress' },
  answers: [answerSchema],
  totalMarksObtained: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Attempt', attemptSchema);
