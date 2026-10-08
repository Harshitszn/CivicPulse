/**
 * Upload routes
 */
const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const upload = require('../middleware/upload');
const { authenticate } = require('../middleware/auth');

// Middleware to accept single image from field 'image' or 'file'
const handleSingleImage = (req, res, next) => {
  upload.any()(req, res, (err) => {
    if (err) return next(err);
    if (req.files && req.files.length > 0) {
      req.file = req.files[0];
    }
    next();
  });
};

// POST /api/uploads/complaint-image
router.post('/complaint-image', authenticate, handleSingleImage, uploadController.uploadComplaintImage);

module.exports = router;
