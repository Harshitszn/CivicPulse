const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'roads',
        'water',
        'electricity',
        'sanitation',
        'parks',
        'streetlights',
        'drainage',
        'noise',
        'encroachment',
        'other',
      ],
    },
    // AI-assisted classification (no real AI yet)
    aiCategory: {
      type: String,
      default: null,
    },
    aiConfidence: {
      type: Number,
      min: 0,
      max: 1,
      default: null,
    },
    department: {
      type: String,
      default: null, // assigned department
    },
    status: {
      type: String,
      enum: ['open', 'acknowledged', 'in_progress', 'resolved', 'closed', 'rejected'],
      default: 'open',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    images: [
      {
        type: String, // URL
      },
    ],
    location: {
      address: { type: String },
      pincode: { type: String },
      ward: { type: String },
      city: { type: String },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    // Denormalized counts for feed performance
    upvotes: {
      type: Number,
      default: 0,
    },
    downvotes: {
      type: Number,
      default: 0,
    },
    commentCount: {
      type: Number,
      default: 0,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for location-based feed queries
complaintSchema.index({ 'location.pincode': 1, status: 1, createdAt: -1 });
complaintSchema.index({ category: 1, status: 1 });
complaintSchema.index({ reportedBy: 1, createdAt: -1 });

module.exports = mongoose.model('Complaint', complaintSchema);
