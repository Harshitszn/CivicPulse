/**
 * Winston logger — structured JSON logging for production,
 * pretty-print colorized output for development.
 */
const { createLogger, format, transports } = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

// Read config directly (avoid circular dependency with env.js importing logger)
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const LOG_DIR = process.env.LOG_DIR || 'logs';
const IS_DEV = (process.env.NODE_ENV || 'development') !== 'production';

// ── Console format (development) ─────────────────────────────────────────────
const devFormat = format.combine(
  format.colorize(),
  format.timestamp({ format: 'HH:mm:ss' }),
  format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp} [${level}] ${message}${metaStr}`;
  })
);

// ── JSON format (production) ──────────────────────────────────────────────────
const prodFormat = format.combine(
  format.timestamp(),
  format.errors({ stack: true }),
  format.json()
);

// ── Rotating file transports ──────────────────────────────────────────────────
const fileTransports = [
  new DailyRotateFile({
    dirname: path.join(process.cwd(), LOG_DIR),
    filename: 'app-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '14d',
    level: LOG_LEVEL,
    format: prodFormat,
  }),
  new DailyRotateFile({
    dirname: path.join(process.cwd(), LOG_DIR),
    filename: 'error-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxSize: '10m',
    maxFiles: '30d',
    level: 'error',
    format: prodFormat,
  }),
];

const logger = createLogger({
  level: LOG_LEVEL,
  transports: [
    new transports.Console({
      format: IS_DEV ? devFormat : prodFormat,
    }),
    ...(!IS_DEV ? fileTransports : []),
  ],
  exitOnError: false,
});

module.exports = logger;
