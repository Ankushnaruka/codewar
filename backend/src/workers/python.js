/**
 * Python Code Execution Worker
 */

import { Worker } from 'bullmq';
import { connection } from '../config/queue.js';
import { logger } from '../utils/logger.js';
import { executeJob } from '../utils/jobExecutor.js';
import { QUEUE_NAMES, LANGUAGES } from '../constants/index.js';
import config from '../config/index.js';

const pythonWorker = new Worker(
  QUEUE_NAMES.PYTHON_JOBS,
  async (job) => {
    try {
      logger.info('Processing Python job', { jobId: job.id });

      const { code, input } = job.data;
      const result = await executeJob(job.id, code, input, LANGUAGES.PYTHON, config.tmpDir);

      logger.info('Python job completed', { jobId: job.id });
      return result;
    } catch (error) {
      logger.error('Python job failed', { jobId: job.id, error: error.message });
      throw error;
    }
  },
  { connection }
);

pythonWorker.on('completed', (job) => {
  logger.info('Worker: Python job completed', { jobId: job.id });
});

pythonWorker.on('failed', (job, err) => {
  logger.error('Worker: Python job failed', { jobId: job.id, error: err.message });
});

export default pythonWorker;
