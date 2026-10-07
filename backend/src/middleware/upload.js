/**
 * Multer file upload middleware for handling image attachments.
 * Stores files in memory for streaming to Cloudinary or local storage.
 */
const multer = require('multer');
const ApiError = require('../utils/ApiError');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new ApiError(400, 'Only image files are allowed'), false);
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
