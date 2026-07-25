const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');
const authMiddleware = require('../middleware/auth');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// POST /api/tutor
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { message, board, classLevel, subject } = req.body;

    const systemPrompt = `You are a helpful, encouraging AI tutor named EduBot. 
The student is studying ${board} curriculum, Class ${classLevel}, subject: ${subject}.
Answer their question clearly and concisely. If the question is not related to their studies, gently guide them back to the topic.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.7,
      max_tokens: 300,
    });

    const reply = chatCompletion.choices[0].message.content.trim();
    res.json({ reply });   // 👈 key is "reply"
  } catch (error) {
    console.error('AI Tutor Error:', error.message);
    // Optional debug: log the full error object
    // console.error(JSON.stringify(error, null, 2));
    res.status(500).json({ reply: 'Sorry, I had trouble thinking. Please try again!' });
  }
});

module.exports = router;