const express = require('express');
const router = express.Router();
const Vote = require('../models/Vote');
const Complaint = require('../models/Complaint');

// POST /api/votes — cast or toggle vote
router.post('/', async (req, res, next) => {
  try {
    const { user, complaint, type } = req.body;

    const existing = await Vote.findOne({ user, complaint });
    if (existing) {
      if (existing.type === type) {
        // Remove vote (toggle off)
        await existing.deleteOne();
        const delta = type === 'upvote' ? -1 : 0;
        const downDelta = type === 'downvote' ? -1 : 0;
        await Complaint.findByIdAndUpdate(complaint, {
          $inc: { upvotes: delta, downvotes: downDelta },
        });
        return res.json({ success: true, action: 'removed', data: null });
      } else {
        // Switch vote
        existing.type = type;
        await existing.save();
        const isUpNow = type === 'upvote';
        await Complaint.findByIdAndUpdate(complaint, {
          $inc: { upvotes: isUpNow ? 1 : -1, downvotes: isUpNow ? -1 : 1 },
        });
        return res.json({ success: true, action: 'switched', data: existing });
      }
    }

    const vote = new Vote({ user, complaint, type });
    await vote.save();
    await Complaint.findByIdAndUpdate(complaint, {
      $inc: { [type === 'upvote' ? 'upvotes' : 'downvotes']: 1 },
    });
    res.status(201).json({ success: true, action: 'created', data: vote });
  } catch (err) {
    next(err);
  }
});

// GET /api/votes?user=xxx&complaint=yyy
router.get('/', async (req, res, next) => {
  try {
    const { user, complaint } = req.query;
    const filter = {};
    if (user) filter.user = user;
    if (complaint) filter.complaint = complaint;
    const votes = await Vote.find(filter);
    res.json({ success: true, data: votes });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
