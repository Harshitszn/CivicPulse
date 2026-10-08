/**
 * User Controller
 */
const UserModel = require('../models/User');
const { ApiResponse } = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

const getProfile = async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.user.id);
    if (!user) {
      throw ApiError.notFound('User not found');
    }
    return ApiResponse.ok(res, user);
  } catch (err) {
    next(err);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { full_name, phone, pincode, avatar_url } = req.body;

    const updates = {};
    if (full_name !== undefined) {
      const trimmedName = String(full_name).trim();
      if (!trimmedName) throw ApiError.badRequest('Name cannot be empty');
      updates.full_name = trimmedName;
    }

    if (phone !== undefined) {
      updates.phone = phone ? String(phone).trim() : null;
    }

    if (pincode !== undefined) {
      if (pincode) {
        const cleanPincode = String(pincode).trim();
        if (!/^\d{6}$/.test(cleanPincode)) {
          throw ApiError.badRequest('Postal pincode must be a 6-digit numeric code');
        }
        updates.pincode = cleanPincode;
      } else {
        updates.pincode = null;
      }
    }

    if (avatar_url !== undefined) {
      updates.avatar_url = avatar_url;
    }

    // Explicitly reject attempts to elevate role or change email through profile update
    const updated = await UserModel.update(req.user.id, updates);
    return ApiResponse.ok(res, updated, 'Profile updated successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProfile,
  updateProfile,
};
