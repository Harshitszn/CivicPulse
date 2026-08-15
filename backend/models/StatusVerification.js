const mongoose = require('mongoose');

const statusVerificationSchema = new mongoose.Schema(
  {
    complaint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Complaint',
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fromStatus: {
      type: String,
      enum: ['open', 'acknowledged', 'in_progress', 'resolved', 'closed', 'rejected'],
      required: true,
    },
    toStatus: {
      type: String,
      enum: ['open', 'acknowledged', 'in_progress', 'resolved', 'closed', 'rejected'],
      required: true,
    },
    note: {
      type: String,
      trim: true,
      maxlength: [500, 'Note cannot exceed 500 characters'],
    },
    // Proof of work — images showing the fix
    proofImages: [
      {
        type: String, // URL
      },
    ],
    // Field verification — did a citizen confirm resolution?
    citizenConfirmed: {
      type: Boolean,
      default: null, // null = not yet asked
    },
    citizenConfirmedAt: {
      type: Date,
      default: null,
    },
    citizenConfirmedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

statusVerificationSchema.index({ complaint: 1, createdAt: -1 });

module.exports = mongoose.model('StatusVerification', statusVerificationSchema);
