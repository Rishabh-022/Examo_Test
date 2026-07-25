const express = require('express');
const router = express.Router();
const Chapter = require('../models/Chapter');
const authMiddleware = require('../middleware/auth');

// GET /api/chapters?board=CBSE&classLevel=10&subject=Physics
router.get('/', authMiddleware, async (req, res) => {
  try {
    // 1. Log what the phone is actually asking for
    console.log("👉 INCOMING FRONTEND REQUEST:", req.query); 

    const { board, classLevel, subject } = req.query;
    const query = {};
    
    if (board) query.board = board;
    
    if (classLevel) {
      const numericClass = String(classLevel).replace(/[^0-9]/g, '');
      if (numericClass) {
        // 2. 🛡️ Search for BOTH String "10" and Number 10 to guarantee a match
        query.classLevel = { $in: [numericClass, parseInt(numericClass, 10)] };
      }
    }
    
    // 3. 🔬 Smart Search: Use Regex to match "Physics Part1", "Chemistry Part2", etc.
    if (subject) {
      query.subject = { $regex: subject, $options: 'i' }; 
    }

    // 4. Log the exact query being sent to MongoDB
    console.log("🔍 MONGODB QUERY:", query);

    const chapters = await Chapter.find(query).sort({ chapterNumber: 1 });
    
    // 5. Log how many chapters were actually found
    console.log(`✅ FOUND ${chapters.length} CHAPTERS`);

    res.json(chapters);
  } catch (err) {
    console.error("❌ ROUTE ERROR:", err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;