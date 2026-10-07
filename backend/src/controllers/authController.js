/**
 * Auth Controller
 */
const AuthService = require('../services/authService');
const { ApiResponse } = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

const register = async (req, res, next) => {
  try {
    const { email, password, full_name, role, phone, pincode, avatar_url } = req.body;
    const result = await AuthService.register({
      email,
      password,
      full_name,
      role,
      phone,
      pincode,
      avatar_url,
    });
    return ApiResponse.created(res, result, 'User registered successfully');
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await AuthService.login({ email, password });
    return ApiResponse.ok(res, result, 'Login successful');
  } catch (err) {
    next(err);
  }
};

const getProfile = async (req, res, next) => {
  try {
    return ApiResponse.ok(res, { user: req.user }, 'User profile retrieved');
  } catch (err) {
    next(err);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      throw ApiError.badRequest('Refresh token is required');
    }
    const result = await AuthService.refreshToken(refreshToken);
    return ApiResponse.ok(res, result, 'Token refreshed');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  getProfile,
  refreshToken,
};
