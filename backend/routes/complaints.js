const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');

// GET /api/complaints — list with filters
router.get('/', async (req, res, next) => {
  try {
    const { pincode, category, status, page = 1, limit = 10, sort = '-createdAt' } = req.query;
    const filter = {};
    if (pincode) filter['location.pincode'] = pincode;
    if (category) filter.category = category;
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [complaints, total] = await Promise.all([
      Complaint.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))
        .populate('reportedBy', 'name avatar'),
      Complaint.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: complaints,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/complaints/:id
router.get('/:id', async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id).populate('reportedBy', 'name avatar');
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });
    res.json({ success: true, data: complaint });
  } catch (err) {
    next(err);
  }
});

// POST /api/complaints
router.post('/', async (req, res, next) => {
  try {
    const complaint = new Complaint(req.body);
    await complaint.save();
    res.status(201).json({ success: true, data: complaint });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/complaints/:id/status
router.patch('/:id/status', async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status, ...(status === 'resolved' && { resolvedAt: new Date() }) },
      { new: true }
    );
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });
    res.json({ success: true, data: complaint });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
