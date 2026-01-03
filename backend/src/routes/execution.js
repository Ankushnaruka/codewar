/**
 * Code Execution Routes
 */

import express from 'express';
import { QueueEvents } from 'bullmq';
import { v4 as uuidv4 } from 'uuid';
import { queues, connection } from '../config/queue.js';
import { executionLimiter } from '../middleware/rateLimiter.js';
import { logger } from '../utils/logger.js';
import { LANGUAGES, QUEUE_JOB_TYPES, HTTP_STATUS } from '../constants/index.js';

const router = express.Router();

const cppQueueEvents = new QueueEvents('cpp-jobs', { connection });
const pythonQueueEvents = new QueueEvents('python-jobs', { connection });

/**
 * POST /run
 * Execute code in the specified language
 * Body: { code, input?, language }
 */
router.post('/run', executionLimiter, async (req, res) => {
  try {
    const { code, input, language } = req.body;

    // Validation
    if (!code || !language) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: 'Missing required fields: code, language'
      });
    }

    if (![LANGUAGES.CPP, LANGUAGES.PYTHON].includes(language)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: `Unsupported language. Supported: ${Object.values(LANGUAGES).join(', ')}`
      });
    }

    const jobId = uuidv4();
    const queue = language === LANGUAGES.CPP ? queues.cpp : queues.python;
    const queueEvents = language === LANGUAGES.CPP ? cppQueueEvents : pythonQueueEvents;
    const jobType = language === LANGUAGES.CPP ? QUEUE_JOB_TYPES.COMPILE : QUEUE_JOB_TYPES.RUN;

    logger.info('New execution request', { jobId, language });

    // Add job to queue
    const job = await queue.add(jobType, {
      language,
      code,
      input,
      jobId
    });

    // Wait for job completion
    const result = await job.waitUntilFinished(queueEvents);

    logger.info('Job completed', { jobId });

    // Clean up
    await job.remove();

    return res.status(HTTP_STATUS.SUCCESS).json({
      state: 'completed',
      output: result.output,
      executionTime: result.executionTime + 'ms',
      jobId: job.id,
      language: language
    });
  } catch (error) {
    logger.error('Execution request failed', { error: error.message });
    return res.status(HTTP_STATUS.INTERNAL_ERROR).json({
      error: 'Job failed or was cancelled',
      details: error.message
    });
  }
});

/**
 * GET /health
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.status(HTTP_STATUS.SUCCESS).json({ status: 'ok' });
});

export default router;
