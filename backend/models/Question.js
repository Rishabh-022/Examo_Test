const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  chapterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chapter',
    required: true
  },
  questionText: { type: String, required: true },
  options: {
    type: [String],
    validate: [arr => arr.length === 4, 'Must have 4 options']
  },
  correctAnswer: { type: String, required: true },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  }
}, { timestamps: true });

module.exports = mongoose.model('Question', QuestionSchema);