/**
 * Upload Controller
 * Handles image uploading to Cloudinary and persists metadata into PostgreSQL complaint_images table.
 */
const CloudinaryService = require('../services/cloudinaryService');
const { db } = require('../config/database');
const { ApiResponse } = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

const uploadComplaintImage = async (req, res, next) => {
  try {
    const file = req.file;
    if (!file) {
      throw ApiError.badRequest('No image file provided. Please attach a valid image file.');
    }

    // 1. Upload buffer to Cloudinary
    const uploadResult = await CloudinaryService.uploadBuffer(file.buffer, 'civicpulse/complaints');
    const cloudinaryUrl = uploadResult.url;
    const publicId = uploadResult.public_id || null;

    // 2. Validate optional complaint_id if supplied
    const rawComplaintId = req.body.complaint_id || req.body.complaintId || null;
    let validComplaintId = null;
    if (rawComplaintId) {
      const existingComplaint = await db('complaints').where({ id: rawComplaintId }).first();
      if (existingComplaint) {
        validComplaintId = existingComplaint.id;
      }
    }

    // 3. Persist image metadata in PostgreSQL complaint_images table (do NOT store binary)
    const [imageRecord] = await db('complaint_images')
      .insert({
        complaint_id: validComplaintId,
        image_url: cloudinaryUrl,
        cloudinary_url: cloudinaryUrl,
        public_id: publicId,
        file_size: file.size || null,
        mime_type: file.mimetype || null,
        is_resolution_proof: Boolean(req.body.is_resolution_proof),
        created_at: db.fn.now(),
      })
      .returning('*');

    // 4. Return created image metadata
    return ApiResponse.created(
      res,
      {
        image: {
          id: imageRecord.id,
          cloudinary_url: imageRecord.cloudinary_url || imageRecord.image_url,
          url: imageRecord.cloudinary_url || imageRecord.image_url,
          public_id: imageRecord.public_id,
          complaint_id: imageRecord.complaint_id,
          file_size: imageRecord.file_size,
          mime_type: imageRecord.mime_type,
          created_at: imageRecord.created_at,
        },
      },
      'Complaint image uploaded successfully'
    );
  } catch (err) {
    next(err);
  }
};

module.exports = {
  uploadComplaintImage,
};
