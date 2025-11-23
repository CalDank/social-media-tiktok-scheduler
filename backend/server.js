import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import postsRouter from './routes/posts.js';
import authRouter from './routes/auth.js';
import uploadRouter from './routes/upload.js';
import { initDatabase } from './database/db.js';
import { startScheduler } from './services/scheduler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Middleware
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'TikTok Scheduler API is running' });
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/posts', postsRouter);
app.use('/api/upload', uploadRouter);

// Initialize database and start server
initDatabase()
  .then(() => {
    console.log('Database initialized successfully');
    
    // Start the scheduler service
    startScheduler();
    console.log('Scheduler service started');
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Frontend URL: ${FRONTEND_URL}`);
    });
  })
  .catch((error) => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  });

export default app;

