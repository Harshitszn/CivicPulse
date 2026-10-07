/**
 * Authentication Service
 */
const bcrypt = require('bcryptjs');
const UserModel = require('../models/User');
const ApiError = require('../utils/ApiError');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');

class AuthService {
  static async register({ email, password, full_name, role = 'citizen', phone, pincode, avatar_url }) {
    const existing = await UserModel.findByEmail(email);
    if (existing) {
      throw ApiError.badRequest('Email is already registered');
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const user = await UserModel.create({
      email,
      password_hash,
      full_name,
      role,
      phone,
      pincode,
      avatar_url,
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
      user,
      accessToken,
      refreshToken,
    };
  }

  static async login({ email, password }) {
    const user = await UserModel.findByEmail(email);
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
      user: safeUser,
      accessToken,
      refreshToken,
    };
  }

  static async refreshToken(token) {
    const decoded = verifyRefreshToken(token);
    const user = await UserModel.findById(decoded.id);
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
    return { accessToken: newAccessToken };
  }
}

module.exports = AuthService;
