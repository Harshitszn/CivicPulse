/**
 * Comment routes
 */
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const commentController = require('../controllers/commentController');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { commentLimiter } = require('../middleware/rateLimiters');

router.get('/complaint/:complaintId', commentController.getComments);
router.post('/complaint/:complaintId', authenticate, commentLimiter, validate([body('content').notEmpty().withMessage('Content is required').isLength({ max: 2000 }).withMessage('Comment must be 2000 characters or fewer')]), commentController.addComment);
router.delete('/:id', authenticate, commentController.deleteComment);

module.exports = router;
