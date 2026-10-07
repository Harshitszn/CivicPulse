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
    const updated = await UserModel.update(req.user.id, {
      full_name,
      phone,
      pincode,
      avatar_url,
    });
    return ApiResponse.ok(res, updated, 'Profile updated successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProfile,
  updateProfile,
};
