/**
 * Rate Limiting Middleware
 */

import rateLimit from 'express-rate-limit';
import { RATE_LIMIT } from '../constants/index.js';

export const executionLimiter = rateLimit({
  windowMs: RATE_LIMIT.WINDOW_MS,
  max: RATE_LIMIT.MAX_REQUESTS,
  message: 'Too many code execution requests, please try again later',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

export default executionLimiter;
