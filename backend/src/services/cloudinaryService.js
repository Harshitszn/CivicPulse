/**
 * Cloudinary file upload service.
 * Supports memory buffers directly via stream upload.
 */
const cloudinary = require('cloudinary').v2;
const { config } = require('../config/env');
const logger = require('../utils/logger');

class CloudinaryService {
  static async uploadBuffer(buffer, folder = 'civicpulse/complaints') {
    if (!config.cloudinary.cloudName || config.cloudinary.cloudName === 'your_cloud_name') {
      throw new Error('Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.');
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder, resource_type: 'auto' },
        (error, result) => {
          if (error) {
            logger.error('Cloudinary upload error:', error);
            return reject(error);
          }
          resolve({
            url: result.secure_url,
            public_id: result.public_id,
          });
        }
      );
      uploadStream.end(buffer);
    });
  }

  static async deleteImage(publicId) {
    if (!config.cloudinary.cloudName || config.cloudinary.cloudName === 'your_cloud_name') return;
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (err) {
      logger.error('Cloudinary delete error:', err);
    }
  }
}

module.exports = CloudinaryService;
