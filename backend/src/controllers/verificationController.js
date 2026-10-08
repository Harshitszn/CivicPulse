/**
 * Verification Controller
 */
const VerificationService = require('../services/verificationService');
const { ApiResponse } = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

/**
 * GET /api/complaints/:id/verification
 * Returns aggregate verification stats + current user's vote (if authenticated).
 */
const getVerificationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || null;
    const status = await VerificationService.getVerificationStatus(id, userId);
    return ApiResponse.ok(res, status, 'Verification status retrieved');
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/complaints/:id/verification
 * Submit or update a citizen's resolution verification.
 *
 * Body: { result: 'RESOLVED' | 'NOT_RESOLVED', remarks?: string }
 */
const submitVerification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { result, remarks } = req.body;

    if (!result || !['RESOLVED', 'NOT_RESOLVED', 'confirmed', 'unresolved'].includes(result)) {
      throw ApiError.badRequest('result must be RESOLVED or NOT_RESOLVED');
    }

    const data = await VerificationService.submitVerification({
      complaintId: id,
      userId: req.user.id,
      userPincode: req.user.pincode,
      result,
      remarks: remarks?.trim() || null,
    });

    return ApiResponse.created(res, data, 'Verification submitted successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/complaints/:id/verification
 * Withdraw the current user's verification.
 */
const withdrawVerification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await VerificationService.withdrawVerification(id, req.user.id);
    return ApiResponse.ok(res, data, 'Verification withdrawn');
  } catch (err) {
    next(err);
  }
};

module.exports = { getVerificationStatus, submitVerification, withdrawVerification };
