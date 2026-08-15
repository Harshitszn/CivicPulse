const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const Complaint = require('../models/Complaint');

// GET /api/comments?complaint=xxx
router.get('/', async (req, res, next) => {
  try {
    const { complaint } = req.query;
    if (!complaint) return res.status(400).json({ success: false, message: 'complaint query param required' });

    const comments = await Comment.find({ complaint, isDeleted: false })
      .sort('createdAt')
      .populate('author', 'name avatar role');
    res.json({ success: true, data: comments });
  } catch (err) {
    next(err);
  }
});

// POST /api/comments
router.post('/', async (req, res, next) => {
  try {
    const comment = new Comment(req.body);
    await comment.save();
    await Complaint.findByIdAndUpdate(req.body.complaint, { $inc: { commentCount: 1 } });
    await comment.populate('author', 'name avatar role');
    res.status(201).json({ success: true, data: comment });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/comments/:id — soft delete
router.delete('/:id', async (req, res, next) => {
  try {
    const comment = await Comment.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });
    res.json({ success: true, data: comment });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
