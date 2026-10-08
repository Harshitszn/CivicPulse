/**
 * Upload routes
 */
const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const upload = require('../middleware/upload');
const { authenticate } = require('../middleware/auth');

// Middleware to accept single image from field 'image' or 'file' strictly
const handleSingleImage = (req, res, next) => {
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'file', maxCount: 1 },
  ])(req, res, (err) => {
    if (err) return next(err);
    if (req.files) {
      req.file = req.files['image']?.[0] || req.files['file']?.[0];
    }
    next();
  });
};

// POST /api/uploads/complaint-image
router.post('/complaint-image', authenticate, handleSingleImage, uploadController.uploadComplaintImage);

module.exports = router;
