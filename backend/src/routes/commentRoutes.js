/**
 * Comment routes
 */
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const commentController = require('../controllers/commentController');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');

router.get('/complaint/:complaintId', commentController.getComments);
router.post('/complaint/:complaintId', authenticate, validate([body('content').notEmpty().withMessage('Content is required')]), commentController.addComment);
router.delete('/:id', authenticate, commentController.deleteComment);

module.exports = router;
