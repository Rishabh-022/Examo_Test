const mongoose = require('mongoose');

const ChapterSchema = new mongoose.Schema({
  board: {
    type: String,
    required: true,
    enum: ['CBSE', 'ICSE']
  },
  classLevel: {
    type: Number,
    required: true,
    min: 6,
    max: 12
  },
  subject: {
    type: String,
    required: true,
    enum: ['Physics', 'Chemistry', 'Biology', 'Mathematics', 'History', 'Geography', 'Computer History']
  },
  chapterNumber: { type: Number, required: true },
  chapterName: { type: String, required: true },
  theoryNotes: { type: String, default: "" }
}, { timestamps: true });

ChapterSchema.index({ board: 1, classLevel: 1, subject: 1 });

module.exports = mongoose.model('Chapter', ChapterSchema);