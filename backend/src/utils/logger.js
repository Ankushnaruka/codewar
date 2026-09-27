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

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  gray: '\x1b[90m'
};

const levelColor = {
  ERROR: COLORS.red,
  WARN: COLORS.yellow,
  INFO: COLORS.green,
  DEBUG: COLORS.gray
};


export const logger = {
  error: (message, data) =>
    console.error(
      `${levelColor.ERROR}${formatMessage(LOG_LEVELS.ERROR, message, data)}${COLORS.reset}`
    ),

  warn: (message, data) =>
    console.warn(
      `${levelColor.WARN}${formatMessage(LOG_LEVELS.WARN, message, data)}${COLORS.reset}`
    ),

  info: (message, data) =>
    console.log(
      `${levelColor.INFO}${formatMessage(LOG_LEVELS.INFO, message, data)}${COLORS.reset}`
    ),

  debug: (message, data) =>
    process.env.DEBUG &&
    console.log(
      `${levelColor.DEBUG}${formatMessage(LOG_LEVELS.DEBUG, message, data)}${COLORS.reset}`
    )
};

export default logger;
