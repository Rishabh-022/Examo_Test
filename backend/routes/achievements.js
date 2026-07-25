const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');

// All possible badges with criteria
const ALL_BADGES = [
  { name: 'Beginner', icon: '🌱', description: 'Earn your first XP', condition: (u) => u.xp >= 10 },
  { name: 'Streak 3', icon: '🔥', description: '3‑day login streak', condition: (u) => u.streak >= 3 },
  { name: 'Streak 7', icon: '🔥🔥', description: '7‑day login streak', condition: (u) => u.streak >= 7 },
  { name: 'Coin Collector', icon: '💰', description: 'Collect 100 coins', condition: (u) => u.coins >= 100 },
  { name: 'Scholar', icon: '🎓', description: 'Reach 500 XP', condition: (u) => u.xp >= 500 },
  { name: 'Level Up', icon: '⬆️', description: 'Reach Level 5', condition: (u) => u.level >= 5 },
];

// GET /api/achievements
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    // Check which badges are newly earned
    const newlyEarned = ALL_BADGES.filter(
      (badge) => !user.badges.includes(badge.name) && badge.condition(user)
    ).map((b) => b.name);

    // Save new badges
    if (newlyEarned.length > 0) {
      user.badges.push(...newlyEarned);
      await user.save();
    }

    // Return full list with earned status
    const badgesWithStatus = ALL_BADGES.map((badge) => ({
      ...badge,
      earned: user.badges.includes(badge.name),
    }));

    res.json(badgesWithStatus);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;