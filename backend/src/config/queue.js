/**
 * BullMQ Queue Configuration
 */

import { Queue } from 'bullmq';
import { getRedisConnection } from './redis.js';
import { QUEUE_NAMES } from '../constants/index.js';

const connection = getRedisConnection();

export const queues = {
  cpp: new Queue(QUEUE_NAMES.CPP_JOBS, { connection }),
  python: new Queue(QUEUE_NAMES.PYTHON_JOBS, { connection })
};

export { connection };
