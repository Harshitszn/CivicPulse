/**
 * PostgreSQL + PostGIS connection via Knex.
 * Single shared pool instance — import this wherever you need DB access.
 */
const knex = require('knex');
const knexfile = require('../../knexfile');
const { config } = require('./env');
const logger = require('../utils/logger');

const environment = config.env;
const knexConfig = knexfile[environment] || knexfile.development;

const db = knex(knexConfig);

/**
 * Test the database connection and verify PostGIS extension.
 * Called once during server startup.
 * @returns {Promise<void>}
 */
async function connectDB() {
  try {
    // Basic connectivity check
    await db.raw('SELECT 1');
    logger.info('✅ PostgreSQL connected');

    // Verify PostGIS extension is available
    const postgisCheck = await db.raw(
      "SELECT 1 FROM pg_extension WHERE extname = 'postgis'"
    );
    if (postgisCheck.rows.length > 0) {
      logger.info('✅ PostGIS extension detected');
    } else {
      logger.warn(
        '⚠️  PostGIS extension not found. Geographic features will be disabled. ' +
        'Run: CREATE EXTENSION IF NOT EXISTS postgis;'
      );
    }
  } catch (err) {
    logger.error('❌ Database connection failed:', err.message);
    logger.error(
      'Make sure PostgreSQL is running and DATABASE_URL is correct in your .env file.'
    );
    // Do not exit — allow server to boot without DB for health check
    // In production you'd want to throw here
    if (config.isProd) throw err;
  }
}

/**
 * Gracefully destroy the connection pool.
 * Called on process exit signals.
 */
async function disconnectDB() {
  await db.destroy();
  logger.info('PostgreSQL connection pool closed.');
}

module.exports = { db, connectDB, disconnectDB };
