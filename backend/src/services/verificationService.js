/**
 * Verification Service
 * Business logic for citizen resolution verification.
 *
 * Rules:
 * 1. Only authenticated citizens from the same pincode as the complaint may verify.
 * 2. Verification is only allowed when complaint status is RESOLVED (or IN_PROGRESS for "in progress" check).
 * 3. One verification per user per complaint — they can change or withdraw their vote.
 * 4. Review flag rule: ≥3 NOT_RESOLVED votes AND ≥60% of total responses are NOT_RESOLVED
 *    → complaint is flagged for municipal review (NOT auto-reverted to unresolved).
 */
const { VerificationModel, REVIEW_THRESHOLD_COUNT, REVIEW_THRESHOLD_PCT } = require('../models/Verification');
const ComplaintModel = require('../models/Complaint');
const { db } = require('../config/database');
const ApiError = require('../utils/ApiError');

class VerificationService {
  /**
   * Submit or update a citizen's verification.
   * @param {string} complaintId
   * @param {string} userId
   * @param {string} userPincode
   * @param {string} result  – 'RESOLVED' | 'NOT_RESOLVED'
   * @param {string|null} remarks
   */
  static async submitVerification({ complaintId, userId, userPincode, result, remarks = null }) {
    const complaint = await ComplaintModel.findById(complaintId);
    if (!complaint) {
      throw ApiError.notFound('Complaint not found');
    }

    // Only for RESOLVED (and optionally IN_PROGRESS) complaints
    const allowedStatuses = ['RESOLVED', 'resolved', 'IN_PROGRESS', 'in_progress'];
    if (!allowedStatuses.includes(complaint.status)) {
      throw ApiError.badRequest(
        `Verification is only allowed for RESOLVED or IN_PROGRESS complaints (current status: ${complaint.status})`
      );
    }

    // Pincode eligibility — fetch authoritatively from PostgreSQL database
    const user = await db('users').where({ id: userId }).first();
    const authoritativePincode = user?.pincode;

    if (!authoritativePincode || String(authoritativePincode).trim() !== String(complaint.pincode).trim()) {
      throw ApiError.forbidden(
        `Only residents of pincode ${complaint.pincode} can verify this complaint. Your registered pincode is ${authoritativePincode || 'not set'}.`
      );
    }

    // Prevent complaint owner from verifying their own complaint
    if (complaint.user_id && String(complaint.user_id) === String(userId)) {
      throw ApiError.forbidden('You cannot verify your own complaint');
    }

    const isConfirmedResolved = result === 'RESOLVED' || result === 'confirmed';

    // Upsert verification
    const verification = await VerificationModel.upsert({
      complaintId,
      userId,
      isConfirmedResolved,
      remarks,
    });

    // Recalculate aggregates
    const aggregates = await VerificationModel.getAggregates(complaintId);

    // Apply review flag if threshold is met
    if (aggregates.shouldFlagForReview) {
      const current = await db('complaints').where({ id: complaintId }).first();
      if (!current.flagged_for_review) {
        await db('complaints')
          .where({ id: complaintId })
          .update({
            flagged_for_review: true,
            flagged_at: db.fn.now(),
            dispute_count: aggregates.disputedCount,
          });

        // Log a status history note (does NOT change the status)
        await db('complaint_status_history').insert({
          complaint_id: complaintId,
          changed_by_user_id: userId,
          from_status: complaint.status,
          to_status: complaint.status,
          notes: `⚠ Flagged for municipal review: ${aggregates.disputedCount} citizens (${aggregates.disputePct}%) report this issue is NOT resolved.`,
        }).catch(() => {}); // non-fatal
      }
    } else if (!aggregates.shouldFlagForReview) {
      // If flag was previously set but now threshold no longer met, remove flag
      const current = await db('complaints').where({ id: complaintId }).first();
      if (current?.flagged_for_review) {
        await db('complaints')
          .where({ id: complaintId })
          .update({ flagged_for_review: false, flagged_at: null, dispute_count: aggregates.disputedCount });
      }
    }

    return {
      verification: {
        id: verification.id,
        complaint_id: complaintId,
        user_id: userId,
        result: isConfirmedResolved ? 'RESOLVED' : 'NOT_RESOLVED',
        is_confirmed_resolved: isConfirmedResolved,
        remarks,
        was_updated: verification.wasUpdated,
        created_at: verification.created_at,
      },
      aggregates: {
        ...aggregates,
        flagged_for_review: aggregates.shouldFlagForReview,
        review_threshold: {
          min_dispute_count: REVIEW_THRESHOLD_COUNT,
          min_dispute_pct: REVIEW_THRESHOLD_PCT,
        },
      },
    };
  }

  /**
   * Get aggregate verification stats for a complaint, plus current user's response.
   */
  static async getVerificationStatus(complaintId, userId = null) {
    const aggregates = await VerificationModel.getAggregates(complaintId);

    let userVerification = null;
    if (userId) {
      const row = await VerificationModel.findUserVerification(complaintId, userId);
      if (row) {
        userVerification = {
          result: row.is_confirmed_resolved ? 'RESOLVED' : 'NOT_RESOLVED',
          is_confirmed_resolved: row.is_confirmed_resolved,
          remarks: row.remarks,
          created_at: row.created_at,
          updated_at: row.updated_at,
        };
      }
    }

    // Get current flagged state from DB
    const complaint = await db('complaints')
      .where({ id: complaintId })
      .select('flagged_for_review', 'flagged_at', 'dispute_count')
      .first();

    return {
      ...aggregates,
      flagged_for_review: complaint?.flagged_for_review || false,
      flagged_at: complaint?.flagged_at || null,
      user_verification: userVerification,
      review_threshold: {
        min_dispute_count: REVIEW_THRESHOLD_COUNT,
        min_dispute_pct: REVIEW_THRESHOLD_PCT,
      },
    };
  }

  /**
   * Withdraw a user's verification.
   */
  static async withdrawVerification(complaintId, userId) {
    const existing = await VerificationModel.findUserVerification(complaintId, userId);
    if (!existing) {
      throw ApiError.notFound('No verification found for this user');
    }
    await VerificationModel.delete(complaintId, userId);

    // Re-check flag after withdrawal
    const aggregates = await VerificationModel.getAggregates(complaintId);
    if (!aggregates.shouldFlagForReview) {
      await db('complaints')
        .where({ id: complaintId })
        .update({ flagged_for_review: false, flagged_at: null, dispute_count: aggregates.disputedCount });
    }

    return { withdrawn: true, aggregates };
  }
}

module.exports = VerificationService;
