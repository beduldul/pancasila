import 'express-async-errors';
   import express from 'express';
   import cors from 'cors';
   import helmet from 'helmet';
   import morgan from 'morgan';
   import rateLimit from 'express-rate-limit';
   import { PrismaClient } from '@prisma/client';
   import path from 'path';
   import fs from 'fs';
   import { config, IS_PROD } from './config';
import routes from './routes';
import { errorHandler } from './middleware/error.middleware';
import { startCleanupWorker } from './workers/cleanup.worker';

// Initialize Prisma
export const prisma = new PrismaClient();

const app = express();

// Trust proxy for rate limiting behind Nginx/Vercel
app.set('trust proxy', 1);

// Global DDoS Protection (Rate Limiting)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per window
  message: { error: 'Terlalu banyak permintaan dari IP Anda. Silakan coba lagi nanti.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

// Security Middlewares
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      frameSrc: ["'self'", "https://www.youtube.com", "https://drive.google.com"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS Configuration
const allowedOrigins = config.ALLOWED_ORIGINS.split(',');
app.use(cors({
  origin: (origin, callback) => {
    // Check if origin matches a trusted Pancasila Vercel pattern
    const isTrustedVercel = origin && (
      origin === 'https://pancasilaedu.vercel.app' ||
      origin.endsWith('.pancasilaedu.vercel.app') ||
      origin === 'https://pancasila.vercel.app' ||
      origin.endsWith('.pancasila.vercel.app') ||
      (origin.includes('pancasila') && origin.endsWith('.vercel.app'))
    );

    // Allow if no origin (like mobile apps or curl) OR in whitelist OR if not in production OR if it is a trusted Pancasila Vercel origin
    if (!origin || allowedOrigins.includes(origin) || !IS_PROD || isTrustedVercel) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With', 
    'X-Admin-Secret-Key', 
    'x-admin-secret-key',
    'X-Super-Pin',
    'x-super-pin'
  ],
}));

// Standard Middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (!IS_PROD) {
  app.use(morgan('dev'));
}

// Ensure Uploads Directory Exists
const uploadsDir = process.env.VERCEL ? '/tmp/uploads' : path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// API Routes
app.use('/api', routes);
app.use('/', routes);


// Global Error Handler
app.use(errorHandler);

// Start Server
const server = app.listen(config.PORT, () => {
  const dbType = config.DATABASE_URL.startsWith('postgres') ? 'PostgreSQL (Cloud)' : 'SQLite (Local)';
  console.log(`
Pancasila Edu API is running!
----------------------------------
Environment : ${config.NODE_ENV}
Port        : ${config.PORT}
API Base    : http://localhost:${config.PORT}/api
Database    : ${dbType}
----------------------------------
  `);

  // Start Background Workers
  startCleanupWorker();
});

export default app;
