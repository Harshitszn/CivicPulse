/**
 * Cloudinary configuration.
 * Call configureCloudinary() once during server startup.
 */
const cloudinary = require('cloudinary').v2;
const { config } = require('./env');
const logger = require('../utils/logger');

function configureCloudinary() {
  const { cloudName, apiKey, apiSecret } = config.cloudinary;

  if (!cloudName || !apiKey || !apiSecret) {
    logger.warn(
      '⚠️  Cloudinary credentials not set. Image upload features will be disabled.'
    );
    return;
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  logger.info('✅ Cloudinary configured');
}

module.exports = { cloudinary, configureCloudinary };
