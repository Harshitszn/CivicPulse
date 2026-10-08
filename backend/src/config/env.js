/**
 * Environment variable validation & typed config export.
 * Fails fast on startup if any required variable is missing.
 */
require('dotenv').config();

const REQUIRED_VARS = [
  'DATABASE_URL',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
];

function validateEnv() {
  const missing = REQUIRED_VARS.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Copy .env.example to .env and fill in the values.'
    );
  }

  // In production: refuse to start with insecure placeholder JWT secrets
  if (process.env.NODE_ENV === 'production') {
    const INSECURE_DEFAULTS = [
      'civicpulse_default_jwt_secret_dev_32chars',
      'civicpulse_default_jwt_refresh_dev_32',
    ];
    if (INSECURE_DEFAULTS.includes(process.env.JWT_SECRET)) {
      throw new Error('SECURITY: JWT_SECRET is set to the development placeholder. Set a strong, unique secret for production.');
    }
    if (INSECURE_DEFAULTS.includes(process.env.JWT_REFRESH_SECRET)) {
      throw new Error('SECURITY: JWT_REFRESH_SECRET is set to the development placeholder. Set a strong, unique secret for production.');
    }
  }
}

/** @type {Object} Typed, validated config object */
const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  isDev: (process.env.NODE_ENV || 'development') === 'development',
  isProd: process.env.NODE_ENV === 'production',

  db: {
    url: process.env.DATABASE_URL,
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'civicpulse_default_jwt_secret_dev_32chars',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'civicpulse_default_jwt_refresh_dev_32',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },

  ai: {
    serviceUrl: process.env.AI_SERVICE_URL || 'http://localhost:8000/api/classify',
    apiKey: process.env.AI_SERVICE_API_KEY,
  },

  cors: {
    origins: (process.env.CORS_ORIGINS || 'http://localhost:5173')
      .split(',')
      .map((o) => o.trim()),
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, // 15 min
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
  },

  logging: {
    level: process.env.LOG_LEVEL || 'info',
    dir: process.env.LOG_DIR || 'logs',
  },
};

module.exports = { config, validateEnv };
