const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const Chapter = require('../models/Chapter');
const authMiddleware = require('../middleware/auth');

// Groq setup
const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ──────────────────────────────────────
// GET /api/questions?chapterId=...  (fetch all questions for a chapter)
// ──────────────────────────────────────
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { chapterId } = req.query;
    console.log(`👉 FETCHING QUESTIONS FOR CHAPTER ID: ${chapterId}`);

    if (!chapterId) {
      return res.status(400).json({ msg: 'chapterId is required' });
    }

    const questions = await Question.find({ chapterId });
    console.log(`✅ FOUND ${questions.length} QUESTIONS`);
    res.json(questions);
  } catch (err) {
    console.error('❌ ERROR FETCHING QUESTIONS:', err.message);
    res.status(500).send('Server error');
  }
});

// ──────────────────────────────────────
// GET /api/questions/random?board=...&classLevel=...&subject=...&limit=...
// ──────────────────────────────────────
router.get('/random', authMiddleware, async (req, res) => {
  try {
    const { board, classLevel, subject, limit = 10 } = req.query;
    const chapterFilter = {};
    if (board) chapterFilter.board = board;
    if (classLevel) chapterFilter.classLevel = parseInt(classLevel);
    if (subject) {
      chapterFilter.subject = { $regex: subject, $options: 'i' };
    }

    const chapters = await Chapter.find(chapterFilter).select('_id');
    const chapterIds = chapters.map(c => c._id);
    if (chapterIds.length === 0) return res.json([]);

    const questions = await Question.aggregate([
      { $match: { chapterId: { $in: chapterIds } } },
      { $sample: { size: parseInt(limit) } }
    ]);
    res.json(questions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// ──────────────────────────────────────
// POST /api/questions/explain  (live AI explanation via Groq)
// ──────────────────────────────────────
router.post('/explain', async (req, res) => {
  try {
    const { questionText, options, selectedAnswer, correctAnswer } = req.body;

    const prompt = `
You are an expert, encouraging exam tutor.
A student just answered a multiple‑choice question.

Question: "${questionText}"
Options: ${options.join(', ')}
Student selected: "${selectedAnswer}"
Correct answer: "${correctAnswer}"

Write a 2–3 sentence explanation.
If the student got it right, praise them briefly and explain why it's correct.
If they got it wrong, gently explain why their choice was incorrect and why the correct answer is right.
Keep it concise, clear, and formatted as plain text.`;

    // Groq's blazing‑fast Llama 3 model
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.1-8b-instant',
      temperature: 0.7,
      max_tokens: 150,
    });

    const explanation = chatCompletion.choices[0].message.content.trim();
    res.json({ explanation });
  } catch (error) {
    console.error('❌ AI Explanation Error:', error.message);

    // Safe fallback – won't crash with ReferenceError
    const fallbackAnswer = req.body?.correctAnswer || 'N/A';
    res.status(500).json({
      explanation: `The correct answer is "${fallbackAnswer}". (Live AI tutor is temporarily unavailable.)`,
    });
  }
});

module.exports = router;