import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config } from './config/env.js';
import { connectDB, getDBStatus } from './config/db.js';
import { seedDatabase } from './seeds/seed.js';

import path from 'path';
import puppyRoutes from './routes/puppyRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import offerRoutes from './routes/offerRoutes.js';
import inquiryRoutes from './routes/inquiryRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import { generalApiLimiter } from './middleware/rateLimiter.js';

const app = express();

// Security HTTP headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Configurable CORS for production & dev
const allowedOrigins = [
  config.clientUrl,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || config.nodeEnv === 'development' || allowedOrigins.includes(origin) || config.clientUrl === '*') {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Apply general rate limiter to all API endpoints
app.use('/api', generalApiLimiter);

// Serve uploaded media files statically
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// Health Check API
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    business: 'B.tech Puppybala',
    location: 'Bhopal, Madhya Pradesh',
    database: getDBStatus(),
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/puppies', puppyRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/upload', uploadRoutes);

// Error Middlewares
app.use(notFound);
app.use(errorHandler);

// Start Server
const startServer = async () => {
  // Connect to MongoDB
  const db = await connectDB();
  if (db) {
    try {
      await seedDatabase();
    } catch (err) {
      console.warn('[Seeder] Note: Auto-seed skipped or completed:', err.message);
    }
  }

  const server = app.listen(config.port, () => {
    console.log(`====================================================`);
    console.log(`🐾 B.tech Puppybala Backend Server Started!`);
    console.log(`📡 Port: http://localhost:${config.port}`);
    console.log(`🐶 Puppies API:   http://localhost:${config.port}/api/puppies`);
    console.log(`📩 Inquiries API: http://localhost:${config.port}/api/inquiries`);
    console.log(`🎁 Offers API:    http://localhost:${config.port}/api/offers`);
    console.log(`🛡️  Admin API:     http://localhost:${config.port}/api/admin/login`);
    console.log(`🏥 Health Check:  http://localhost:${config.port}/api/health`);
    console.log(`====================================================`);
  });

  return server;
};

startServer();

export default app;
