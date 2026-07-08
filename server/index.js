import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './db.js';
import userRoutes from './routes/user.js';
import analyzeRoutes from './routes/analyze.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ──────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'https://git-scope-theta.vercel.app'
];

if (process.env.FRONTEND_URL) {
  const additional = process.env.FRONTEND_URL.split(',').map(o => o.trim());
  allowedOrigins.push(...additional);
}

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, mobile apps)
    if (!origin) return callback(null, true);
    // Always check against the explicit allowedOrigins list
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin ${origin} not allowed`));
    }
  },
  credentials: true
}));
app.use(express.json());

// ── Routes ─────────────────────────────────────────
app.use('/api/user', userRoutes);
app.use('/api/analyze', analyzeRoutes);  // legacy: POST /api/analyze
app.use('/api', analyzeRoutes);           // Day 5: POST /api/analyze-repo

// ── Health check ───────────────────────────────────
app.get('/api/health', async (req, res) => {
  try {
    const dbResult = await pool.query('SELECT NOW()');
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      db: dbResult.rows[0].now,
    });
  } catch (err) {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      db: 'not connected',
    });
  }
});

// ── Start server ───────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 GitScope server running on http://localhost:${PORT}`);
});
