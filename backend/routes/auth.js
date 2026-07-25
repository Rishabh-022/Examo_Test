const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

// ──────────────────────────────────────
// 1. REGISTER
// ──────────────────────────────────────
router.post('/register', async (req, res) => {
  const { username, email, password, board, classLevel } = req.body;

  try {
    if (!username || !email || !password) {
      return res.status(400).json({ msg: 'Please enter all required fields' });
    }

    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    user = new User({
      username,
      email,
      password,
      board: board || 'CBSE',
      classLevel: classLevel || 6
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    const payload = {
      user: {
        id: user.id,
        username: user.username,
        board: user.board,
        classLevel: user.classLevel
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// ──────────────────────────────────────
// 2. LOGIN
// ──────────────────────────────────────
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ msg: 'Please enter email and password' });
    }

    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const today = new Date().toDateString();
    const lastLogin = user.lastLoginDate
      ? user.lastLoginDate.toDateString()
      : null;

    if (lastLogin !== today) {
      user.streak = (user.streak || 0) + 1;
      user.lastLoginDate = new Date();
      await user.save();
    }

    const payload = {
      user: {
        id: user.id,
        username: user.username,
        board: user.board,
        classLevel: user.classLevel
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// ──────────────────────────────────────
// 3. GET USER PROFILE (PROTECTED)
// ──────────────────────────────────────
router.get('/user', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// ──────────────────────────────────────
// 4. CLAIM DAILY REWARD (PROTECTED)
// ──────────────────────────────────────
router.post('/claim-daily', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const today = new Date().toDateString();
    const lastClaim = user.lastClaimDate
      ? user.lastClaimDate.toDateString()
      : null;

    // Already claimed today?
    if (lastClaim === today) {
      return res.status(400).json({ msg: 'Daily reward already claimed' });
    }

    // Calculate reward: 10 base + 5 per streak day
    const baseCoins = 10;
    const streakBonus = (user.streak || 0) * 5;
    const totalCoins = baseCoins + streakBonus;

    user.coins += totalCoins;
    user.lastClaimDate = new Date();
    await user.save();

    res.json({
      coinsAwarded: totalCoins,
      newCoins: user.coins,
      streak: user.streak,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// POST /api/auth/update-progress
router.post('/update-progress', authMiddleware, async (req, res) => {
  try {
    const { earnedXP } = req.body;

    // 1. Get current user
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    // 2. Calculate new totals
    const newXP = (user.xp || 0) + earnedXP;
    const newLevel = Math.floor(newXP / 100) + 1;   // 0‑99 → Lv1, 100‑199 → Lv2, etc.

    // 3. Update using the modern Mongoose syntax (no more warning!)
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { xp: newXP, level: newLevel },
      { returnDocument: 'after' }      // ← fixes the deprecation warning
    );

    res.json({ xp: updatedUser.xp, level: updatedUser.level });
  } catch (err) {
    console.error('Progress Update Error:', err);
    res.status(500).send('Server error');
  }
});

module.exports = router;