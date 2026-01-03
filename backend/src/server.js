/**
 * Server Entry Point
 */

import app from './app.js';
import config from './config/index.js';
import { logger } from './utils/logger.js';
import cppWorker from './workers/cpp.js';
import pythonWorker from './workers/python.js';

const PORT = config.port;

// Start workers
logger.info('Starting workers...');

// Start server
const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`, {
    environment: config.env,
    redis: `${config.redis.host}:${config.redis.port}`
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  
  try {
    await cppWorker.close();
    await pythonWorker.close();
    server.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
  } catch (error) {
    logger.error('Error during shutdown', { error: error.message });
    process.exit(1);
  }
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully...');
  
  try {
    await cppWorker.close();
    await pythonWorker.close();
    server.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
  } catch (error) {
    logger.error('Error during shutdown', { error: error.message });
    process.exit(1);
  }
});

export default server;
