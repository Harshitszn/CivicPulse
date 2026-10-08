/**
 * Multer file upload middleware for handling image attachments.
 * Stores files in memory for streaming to Cloudinary.
 * Strict MIME type and file extension verification to prevent malicious file uploads.
 */
const path = require('path');
const multer = require('multer');
const ApiError = require('../utils/ApiError');

const storage = multer.memoryStorage();

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/jpg',
  'image/heic',
]);

const ALLOWED_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.heic',
]);

const fileFilter = (req, file, cb) => {
  const mime = (file.mimetype || '').toLowerCase();
  const ext = path.extname(file.originalname || '').toLowerCase();

  // Explicitly deny SVG, HTML, or executable types
  if (mime.includes('svg') || ext === '.svg' || ext === '.html' || ext === '.htm' || ext === '.js') {
    return cb(new ApiError(400, 'SVG or executable files are not allowed for security reasons.'), false);
  }

  if (ALLOWED_MIME_TYPES.has(mime) && ALLOWED_EXTENSIONS.has(ext)) {
    cb(null, true);
  } else {
    cb(
      new ApiError(
        400,
        'Invalid file type. Only JPEG, PNG, and WebP images up to 5MB are accepted.'
      ),
      false
    );
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
    files: 5,
  },
  fileFilter,
});

module.exports = upload;
