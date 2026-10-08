/**
 * Complaint routes
 */
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const complaintController = require('../controllers/complaintController');
const validate = require('../middleware/validate');
const upload = require('../middleware/upload');
const { authenticate, optionalAuthenticate, requireRole } = require('../middleware/auth');

const complaintValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('pincode').trim().notEmpty().withMessage('Pincode is required'),
];

router.get('/', optionalAuthenticate, complaintController.listComplaints);
router.get('/insights', complaintController.getInsights);
router.get('/mine', authenticate, complaintController.getMyComplaints);
router.get('/:id', optionalAuthenticate, complaintController.getComplaint);
router.get('/:id/status-history', optionalAuthenticate, complaintController.getStatusHistory);
router.post('/', authenticate, upload.array('images', 5), validate(complaintValidation), complaintController.createComplaint);
router.post('/:id/vote', authenticate, complaintController.voteComplaint);
router.patch('/:id', authenticate, complaintController.updateComplaint);
router.patch('/:id/status', authenticate, requireRole('official', 'staff', 'admin'), complaintController.updateStatus);


module.exports = router;
