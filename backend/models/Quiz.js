const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  type: { type: String, enum: ['mcq', 'descriptive'], required: true },
  text: { type: String, required: true },
  options: [{ type: String }], // For MCQ
  correctOption: { type: Number }, // Index of correct option for MCQ
  keywords: [{ type: String }], // For Descriptive AI Evaluation
  marks: { type: Number, required: true, default: 1 }
});

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  duration: { type: Number, required: true }, // in minutes
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  questions: [questionSchema],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Quiz', quizSchema);
