/**
 * Complaint routes
 */
const express = require('express');
const { body } = require('express-validator');
const router = express.Router({ mergeParams: true });
const complaintController = require('../controllers/complaintController');
const verificationRouter = require('./verificationRoutes');
const validate = require('../middleware/validate');
const upload = require('../middleware/upload');
const { authenticate, optionalAuthenticate, requireRole } = require('../middleware/auth');
const { complaintCreateLimiter, voteLimiter } = require('../middleware/rateLimiters');

const complaintValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('pincode').trim().matches(/^\d{6}$/).withMessage('Pincode must be a 6-digit numeric postal code'),
];

router.get('/', optionalAuthenticate, complaintController.listComplaints);
router.get('/nearby', optionalAuthenticate, complaintController.getNearbyComplaints);
router.get('/area', optionalAuthenticate, complaintController.getAreaComplaints);
router.get('/map', optionalAuthenticate, complaintController.getMapCoordinates);
router.get('/insights', complaintController.getInsights);
router.get('/mine', authenticate, complaintController.getMyComplaints);
router.get('/:id', optionalAuthenticate, complaintController.getComplaint);
router.get('/:id/status-history', optionalAuthenticate, complaintController.getStatusHistory);
router.post('/', authenticate, complaintCreateLimiter, upload.array('images', 5), validate(complaintValidation), complaintController.createComplaint);
router.post('/:id/vote', authenticate, voteLimiter, complaintController.voteComplaint);
router.patch('/:id', authenticate, complaintController.updateComplaint);
router.patch('/:id/status', authenticate, requireRole('official', 'staff', 'admin'), complaintController.updateStatus);

// Citizen resolution verification sub-router
router.use('/:id/verification', verificationRouter);

module.exports = router;
