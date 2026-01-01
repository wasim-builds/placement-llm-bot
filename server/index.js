import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import chatRouter from './routes/chat.js';
import interviewRouter from './routes/interview.js';
import jobsRouter from './routes/jobs.js';
import applicationsRouter from './routes/applications.js';
import videosRouter from './routes/videos.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Create uploads directories if they don't exist
const uploadsDir = path.join(__dirname, '../uploads');
const resumesDir = path.join(uploadsDir, 'resumes');
const videosDir = path.join(uploadsDir, 'videos');

[uploadsDir, resumesDir, videosDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Created directory: ${dir}`);
  }
});

// Basic middleware
app.use(cors());
app.use(express.json());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use('/api/chat', chatRouter);
app.use('/api/interview', interviewRouter);
app.use('/api/jobs', jobsRouter);
app.use('/api/applications', applicationsRouter);
app.use('/api/videos', videosRouter);

const port = process.env.PORT || 5001;
app.listen(port, () => {
  console.log(`🚀 Interview Bot server running on port ${port}`);
  console.log(`📍 Health check: http://localhost:${port}/health`);
  console.log(`💼 HR Module enabled`);
});
