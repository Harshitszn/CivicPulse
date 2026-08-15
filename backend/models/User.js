const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String, // URL to profile picture
      default: null,
    },
    role: {
      type: String,
      enum: ['citizen', 'municipal_officer', 'admin'],
      default: 'citizen',
    },
    pincode: {
      type: String,
      trim: true,
    },
    ward: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    department: {
      type: String, // for municipal officers
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Stats (denormalized for performance)
    complaintsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);
