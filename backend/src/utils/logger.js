/**
 * Logger Utility
 */

const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

const formatMessage = (level, message, data = null) => {
  const timestamp = new Date().toISOString();
  const dataStr = data ? ` | ${JSON.stringify(data)}` : '';
  return `[${timestamp}] [${level}] ${message}${dataStr}`;
};

export const logger = {
  error: (message, data) => console.error(formatMessage(LOG_LEVELS.ERROR, message, data)),
  warn: (message, data) => console.warn(formatMessage(LOG_LEVELS.WARN, message, data)),
  info: (message, data) => console.log(formatMessage(LOG_LEVELS.INFO, message, data)),
  debug: (message, data) => process.env.DEBUG && console.log(formatMessage(LOG_LEVELS.DEBUG, message, data))
};

export default logger;
