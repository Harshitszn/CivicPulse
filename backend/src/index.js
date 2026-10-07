/**
 * Server Entry Point
 */
require('dotenv').config();

const app = require('./app');
const { config, validateEnv } = require('./config/env');
const { connectDB, disconnectDB } = require('./config/database');
const { configureCloudinary } = require('./config/cloudinary');
const logger = require('./utils/logger');

async function bootstrap() {
  try {
    // 1. Validate required environment variables
    validateEnv();
    logger.info('⚙️  Environment variables validated');

    // 2. Configure external services
    configureCloudinary();

    // 3. Connect to PostgreSQL + PostGIS
    await connectDB();

    // 4. Start HTTP Server
    const server = app.listen(config.port, () => {
      logger.info(`🚀 CivicPulse API server listening on http://localhost:${config.port}`);
      logger.info(`🌐 Health check available at: http://localhost:${config.port}/api/health`);
    });

    // Graceful shutdown handling
    const shutdown = async (signal) => {
      logger.info(`\n${signal} received. Starting graceful shutdown...`);
      server.close(async () => {
        logger.info('HTTP server closed.');
        await disconnectDB();
        logger.info('CivicPulse Backend stopped successfully.');
        process.exit(0);
      });

      // Force exit after 10s if stuck
      setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();
