const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');

// 🔥 Load environment variables BEFORE anything else
dotenv.config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const chapterRoutes = require('./routes/chapters');
const questionRoutes = require('./routes/questions');
const leaderboardRoutes = require('./routes/leaderboard');
const tutorRoutes = require('./routes/tutor');       // ← AI Tutor route

// Models needed for matchmaking
const Chapter = require('./models/Chapter');
const Question = require('./models/Question');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database
connectDB();

// REST API routes
app.use('/api/auth', authRoutes);
app.use('/api/chapters', chapterRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/tutor', tutorRoutes);                  // ← AI Tutor endpoint
app.use('/api/achievements', require('./routes/achievements'));

// Health check
app.get('/', (req, res) => res.send('EduQuest API running'));

// ────────────────────────────────────────
// Socket.io Setup
// ────────────────────────────────────────
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

// Holds the waiting player's details
let waitingUser = null;   // { socket, board, classLevel, subject }

// Ready‑check map: room -> number of players who pressed Ready
const roomReady = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // ───────────────── Matchmaking ─────────────────
  socket.on('find-match', async (data) => {
    // data: { userId, board, classLevel, subject }
    if (waitingUser && waitingUser.socket.id !== socket.id) {
      const opponent = waitingUser;
      waitingUser = null;

      // Extract shared parameters from the first player (or opponent)
      const { board, classLevel, subject } = opponent;

      // Generate a common set of 10 random questions
      const chapterFilter = { board, classLevel, subject };
      const chapters = await Chapter.find(chapterFilter).select('_id');
      const chapterIds = chapters.map(c => c._id);

      let questions = [];
      if (chapterIds.length > 0) {
        questions = await Question.aggregate([
          { $match: { chapterId: { $in: chapterIds } } },
          { $sample: { size: 10 } }
        ]);
      }

      // Create a room for both players
      const room = `${opponent.socket.id}#${socket.id}`;
      socket.join(room);
      opponent.socket.join(room);

      // Notify both players with the room, players, and shared questions
      io.to(room).emit('match-found', {
        room,
        players: [opponent.socket.id, socket.id],
        questions
      });

    } else {
      // No opponent yet – store the current player's data
      waitingUser = {
        socket,
        board: data.board,
        classLevel: data.classLevel,
        subject: data.subject
      };
      socket.emit('waiting');
    }
  });

  // ───────────────── Room Join ─────────────────
  socket.on('join-room', (room) => {
    socket.join(room);
    console.log(`Socket ${socket.id} joined room ${room}`);
  });

  // ───────────────── Ready check ─────────────────
  socket.on('player-ready', (data) => {
    const { room } = data;
    if (!room) return;

    const readyCount = roomReady.get(room) || 0;
    const newCount = readyCount + 1;
    roomReady.set(room, newCount);

    console.log(`🎯 Room ${room}: ${newCount}/2 players ready`);

    if (newCount >= 2) {
      roomReady.delete(room);
      io.to(room).emit('both-ready');
    }
  });

  // ───────────────── In‑game events ─────────────────
  socket.on('answer', (data) => {
    // Forward answer to opponent
    socket.to(data.room).emit('opponent-answer', data);
  });

  socket.on('end-battle', (data) => {
    // Notify opponent that battle has ended
    socket.to(data.room).emit('battle-end', data);
  });

  // ───────────────── Disconnect ─────────────────
  socket.on('disconnect', () => {
    if (waitingUser && waitingUser.socket.id === socket.id) {
      waitingUser = null;
    }
    console.log('User disconnected:', socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🔥 Server on port ${PORT}`));