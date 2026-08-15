require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const complaintsRouter = require('./routes/complaints');
const usersRouter = require('./routes/users');
const votesRouter = require('./routes/votes');
const commentsRouter = require('./routes/comments');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/civicpulse';

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Health check ────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'CivicPulse API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/complaints', complaintsRouter);
app.use('/api/users', usersRouter);
app.use('/api/votes', votesRouter);
app.use('/api/comments', commentsRouter);

// ── 404 handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ── Error handler ────────────────────────────────────────────────────────────
app.use(errorHandler);

// ── Database + Server ────────────────────────────────────────────────────────
async function startServer() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected:', MONGODB_URI);
  } catch (err) {
    console.warn('⚠️  MongoDB connection failed — running without database');
    console.warn('   Start MongoDB or update MONGODB_URI in .env');
  }

  app.listen(PORT, () => {
    console.log(`🚀 CivicPulse API running on http://localhost:${PORT}`);
  });
}

startServer();
