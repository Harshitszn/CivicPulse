const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    complaint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Complaint',
      required: true,
    },
    type: {
      type: String,
      enum: ['upvote', 'downvote'],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// One vote per user per complaint
voteSchema.index({ user: 1, complaint: 1 }, { unique: true });

module.exports = mongoose.model('Vote', voteSchema);
