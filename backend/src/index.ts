import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import emailRoutes from './routes/email.routes';
import { connectDB } from './config/db';
import { initEmailWorker } from './queue/email.worker';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Health Check
app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/emails', emailRoutes);

// Server startup
async function startServer() {
  console.log('⚡ Initializing Email Scheduler Backend...');
  
  // Connect DB
  await connectDB();

  // Initialize BullMQ Worker
  try {
    initEmailWorker();
    console.log('👷 BullMQ Worker listening for email jobs...');
  } catch (error) {
    console.error('❌ Failed to initialize BullMQ Worker:', error);
  }

  app.listen(PORT, () => {
    console.log(`🚀 Backend Server running on http://localhost:${PORT}`);
  });
}

startServer();
