const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  board: { type: String, enum: ['CBSE', 'ICSE'], default: 'CBSE' },
  classLevel: { type: Number, min: 6, max: 12, default: 6 },
  level: { type: Number, default: 1 },
  xp: { type: Number, default: 0 },
  coins: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  lastLoginDate: { type: Date },
  lastClaimDate: { type: Date },
  completedChapters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Chapter' }],
  badges: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);