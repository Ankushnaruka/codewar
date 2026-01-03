/**
 * Job Execution Utility
 * Handles common job execution logic for workers
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { logger } from './logger.js';
import { LANGUAGES, DOCKER_LIMITS, FILE_NAMES } from '../constants/index.js';

/**
 * Execute a job in Docker container
 * @param {string} jobId - Unique job identifier
 * @param {string} code - Source code to execute
 * @param {string} input - Input data for the program
 * @param {string} language - Programming language (cpp or python)
 * @param {string} tmpDir - Temporary directory path
 * @returns {Promise<{output: string, executionTime: string}>}
 */
export const executeJob = async (jobId, code, input, language, tmpDir) => {
  const jobDir = path.join(tmpDir, language, jobId.toString());
  
  try {
    // Create job directory
    fs.mkdirSync(jobDir, { recursive: true });
    
    // Write source code
    const sourceFileName = language === LANGUAGES.CPP ? FILE_NAMES.SOURCE_CPP : FILE_NAMES.SOURCE_PYTHON;
    fs.writeFileSync(path.join(jobDir, sourceFileName), code);
    
    // Write input
    fs.writeFileSync(path.join(jobDir, FILE_NAMES.INPUT), input || '');
    
    logger.info(`Executing ${language} job`, { jobId });
    
    // Execute in Docker
    const dockerImage = language === LANGUAGES.CPP ? 'cpp-runner' : 'python-runner';
    const dockerCmd = `docker run --rm --cpus="${DOCKER_LIMITS.CPU}" --memory="${DOCKER_LIMITS.MEMORY}" --network none -v "${process.cwd()}\\${jobDir}:/app" ${dockerImage}`;
    
    execSync(dockerCmd, { stdio: 'inherit' });
    
    // Read results
    const output = fs.readFileSync(path.join(jobDir, FILE_NAMES.OUTPUT), 'utf-8');
    const executionTime = fs.readFileSync(path.join(jobDir, FILE_NAMES.TIME), 'utf-8').trim();
    
    logger.info(`Job completed successfully`, { jobId, executionTime });
    
    return { output, executionTime };
  } catch (error) {
    logger.error(`Job execution failed`, { jobId, error: error.message });
    throw error;
  }
};

/**
 * Cleanup job directory
 * @param {string} jobId - Job identifier
 * @param {string} language - Programming language
 * @param {string} tmpDir - Temporary directory path
 */
export const cleanupJob = (jobId, language, tmpDir) => {
  try {
    const jobDir = path.join(tmpDir, language, jobId.toString());
    if (fs.existsSync(jobDir)) {
      fs.rmSync(jobDir, { recursive: true, force: true });
      logger.debug(`Cleaned up job directory`, { jobId });
    }
  } catch (error) {
    logger.warn(`Failed to cleanup job directory`, { jobId, error: error.message });
  }
};
