/**
 * Application Constants
 */

export const LANGUAGES = {
  CPP: 'cpp',
  PYTHON: 'python'
};

export const QUEUE_NAMES = {
  CPP_JOBS: 'cpp-jobs',
  PYTHON_JOBS: 'python-jobs'
};

export const QUEUE_JOB_TYPES = {
  COMPILE: 'compile',
  RUN: 'run'
};

export const DOCKER_LIMITS = {
  CPU: '1',
  MEMORY: '256m'
};

export const RATE_LIMIT = {
  WINDOW_MS: 60 * 1000, // 1 minute
  MAX_REQUESTS: 6
};

export const EXECUTION_PATHS = {
  CPP: 'cpp',
  PYTHON: 'python'
};

export const FILE_NAMES = {
  SOURCE_CPP: 'main.cpp',
  SOURCE_PYTHON: 'main.py',
  INPUT: 'input.txt',
  OUTPUT: 'output.txt',
  TIME: 'time.txt'
};

export const HTTP_STATUS = {
  SUCCESS: 200,
  BAD_REQUEST: 400,
  INTERNAL_ERROR: 500
};
