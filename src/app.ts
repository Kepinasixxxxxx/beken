import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';

import websiteRoutes from './routes/website.routes';
import mobileRoutes from './routes/mobile.routes';
import webhookRoutes from './routes/webhooks.routes';
import docsRouter from './docs/docs.router';
import { errorHandler } from './middlewares/error-handler';
import { env } from './config/env';

import { getRedisStatus } from './config/redis';

const app = express();

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(
  cors({
    origin: env.WEBSITE_FRONTEND_URL || '*',
    credentials: true,
  })
);
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static uploaded files
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

// Serve API Documentation (Scalar UI & Swagger UI)
app.use(docsRouter);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'vieguard-backend',
    redis: getRedisStatus() ? 'connected' : 'disconnected',
    timestamp: new Date(),
  });
});


// Client routes mounting per AGENT.md section 4
app.use('/api/v0/website', websiteRoutes);
app.use('/api/v0/mobile', mobileRoutes);
app.use('/api/v0/webhooks', webhookRoutes);

// Global Error Handler
app.use(errorHandler);

export default app;
