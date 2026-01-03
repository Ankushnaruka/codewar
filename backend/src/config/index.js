/**
 * Centralized Configuration
 */

import dotenv from 'dotenv';

dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  redis: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT || '6379', 10)
  },
  api: {
    rateLimit: {
      windowMs: 60 * 1000, // 1 minute
      max: 6 // requests per window
    }
  },
  docker: {
    cpus: '1',
    memory: '256m'
  },
  tmpDir: process.env.TMP_DIR || 'tmp',
  isDevelopment: process.env.NODE_ENV !== 'production',
  isProduction: process.env.NODE_ENV === 'production'
};

export default config;
