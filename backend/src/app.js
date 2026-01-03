/**
 * Express Application Setup
 */

import express from 'express';
import config from './config/index.js';
import executionLimiter from './middleware/rateLimiter.js';
import executionRoutes from './routes/execution.js';
import { logger } from './utils/logger.js';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/', executionRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error', { error: err.message });
  res.status(500).json({
    error: 'Internal server error',
    ...(config.isDevelopment && { details: err.message })
  });
});

export default app;
