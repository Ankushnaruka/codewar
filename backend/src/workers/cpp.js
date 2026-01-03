/**
 * C++ Code Execution Worker
 */

import { Worker } from 'bullmq';
import { connection } from '../config/queue.js';
import { logger } from '../utils/logger.js';
import { executeJob } from '../utils/jobExecutor.js';
import { QUEUE_NAMES, LANGUAGES } from '../constants/index.js';
import config from '../config/index.js';

const cppWorker = new Worker(
  QUEUE_NAMES.CPP_JOBS,
  async (job) => {
    try {
      logger.info('Processing C++ job', { jobId: job.id });

      const { code, input } = job.data;
      const result = await executeJob(job.id, code, input, LANGUAGES.CPP, config.tmpDir);

      logger.info('C++ job completed', { jobId: job.id });
      return result;
    } catch (error) {
      logger.error('C++ job failed', { jobId: job.id, error: error.message });
      throw error;
    }
  },
  { connection }
);

cppWorker.on('completed', (job) => {
  logger.info('Worker: C++ job completed', { jobId: job.id });
});

cppWorker.on('failed', (job, err) => {
  logger.error('Worker: C++ job failed', { jobId: job.id, error: err.message });
});

export default cppWorker;
