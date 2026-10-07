/**
 * Authentication Service
 */
const bcrypt = require('bcryptjs');
const UserModel = require('../models/User');
const ApiError = require('../utils/ApiError');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');

class AuthService {
  /**
   * Register a new user
   */
  static async register({ email, password, full_name, name, role = 'citizen', phone, pincode, avatar_url }) {
    const resolvedName = (full_name || name || '').trim();
    if (!resolvedName) {
      throw ApiError.badRequest('Name is required');
    }

    if (!email || !email.trim()) {
      throw ApiError.badRequest('Email is required');
    }

    if (!password || password.length < 6) {
      throw ApiError.badRequest('Password must be at least 6 characters');
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await UserModel.findByEmail(cleanEmail);
    if (existing) {
      throw ApiError.badRequest('Email is already registered. Please login instead.');
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const user = await UserModel.create({
      email: cleanEmail,
      password_hash,
      full_name: resolvedName,
      role: role || 'citizen',
      phone: phone || null,
      pincode: pincode || null,
      avatar_url: avatar_url || null,
    });

    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      pincode: user.pincode,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    return {
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        name: user.full_name,
        role: user.role,
        phone: user.phone,
        pincode: user.pincode,
        avatar_url: user.avatar_url,
        created_at: user.created_at,
      },
      token: accessToken,
      accessToken,
      refreshToken,
    };
  }

  /**
   * Login user
   */
  static async login({ email, password }) {
    if (!email || !email.trim()) {
      throw ApiError.badRequest('Email is required');
    }
    if (!password) {
      throw ApiError.badRequest('Password is required');
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await UserModel.findByEmail(cleanEmail);
    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      pincode: user.pincode,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    const { password_hash, ...safeUser } = user;

    return {
      user: {
        ...safeUser,
        name: safeUser.full_name,
      },
      token: accessToken,
      accessToken,
      refreshToken,
    };
  }

  /**
   * Get current user profile by user ID
   */
  static async getMe(userId) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    return {
      ...user,
      name: user.full_name,
    };
  }

  /**
   * Refresh JWT token
   */
  static async refreshToken(token) {
    const decoded = verifyRefreshToken(token);
    const user = await UserModel.findById(decoded.id || decoded.userId);
    if (!user) {
      throw ApiError.unauthorized('User not found');
    }

    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      pincode: user.pincode,
    };

    const newAccessToken = generateAccessToken(tokenPayload);
    return {
      token: newAccessToken,
      accessToken: newAccessToken,
    };
  }
}

module.exports = AuthService;
