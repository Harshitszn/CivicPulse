/**
 * Verification Model
 * Data access for resolution_verifications table.
 *
 * Rule: One verification per user per complaint. Users can update their response.
 * Threshold: If ≥3 citizens AND ≥60% say NOT_RESOLVED → flag for review.
 */
const { db } = require('../config/database');

const TABLE = 'resolution_verifications';

// Minimum NOT_RESOLVED votes required to trigger a review flag
const REVIEW_THRESHOLD_COUNT = 3;
// Minimum % of NOT_RESOLVED responses to trigger a review flag
const REVIEW_THRESHOLD_PCT = 60;

class VerificationModel {
  /**
   * Get a single verification for a user on a complaint.
   */
  static async findUserVerification(complaintId, userId) {
    return db(TABLE)
      .where({ complaint_id: complaintId, verified_by_user_id: userId })
      .first();
  }

  /**
   * Get aggregate counts for a complaint.
   */
  static async getAggregates(complaintId) {
    const rows = await db(TABLE)
      .where({ complaint_id: complaintId })
      .select('is_confirmed_resolved')
      .count('id as count')
      .groupBy('is_confirmed_resolved');

    let confirmedCount = 0;
    let disputedCount = 0;

    for (const row of rows) {
      const cnt = parseInt(row.count, 10);
      if (row.is_confirmed_resolved === true || row.is_confirmed_resolved === 1) {
        confirmedCount = cnt;
      } else {
        disputedCount = cnt;
      }
    }

    const totalResponses = confirmedCount + disputedCount;
    const confirmationPct = totalResponses > 0
      ? Math.round((confirmedCount / totalResponses) * 100)
      : 0;
    const disputePct = totalResponses > 0
      ? Math.round((disputedCount / totalResponses) * 100)
      : 0;

    // Review flag rule: ≥3 disputed AND ≥60% of responses are NOT_RESOLVED
    const shouldFlagForReview = disputedCount >= REVIEW_THRESHOLD_COUNT
      && disputePct >= REVIEW_THRESHOLD_PCT;

    return {
      confirmedCount,
      disputedCount,
      totalResponses,
      confirmationPct,
      disputePct,
      shouldFlagForReview,
    };
  }

  /**
   * Upsert a verification (insert or update existing).
   */
  static async upsert({ complaintId, userId, isConfirmedResolved, remarks = null }) {
    const existing = await VerificationModel.findUserVerification(complaintId, userId);

    if (existing) {
      await db(TABLE)
        .where({ id: existing.id })
        .update({
          is_confirmed_resolved: isConfirmedResolved,
          remarks,
          updated_at: db.fn.now(),
        });
      return { ...existing, is_confirmed_resolved: isConfirmedResolved, remarks, wasUpdated: true };
    }

    const [inserted] = await db(TABLE)
      .insert({
        complaint_id: complaintId,
        verified_by_user_id: userId,
        is_confirmed_resolved: isConfirmedResolved,
        remarks,
      })
      .returning('*');

    return { ...inserted, wasUpdated: false };
  }

  /**
   * Delete a user's verification (withdraw vote).
   */
  static async delete(complaintId, userId) {
    return db(TABLE)
      .where({ complaint_id: complaintId, verified_by_user_id: userId })
      .delete();
  }
}

module.exports = { VerificationModel, REVIEW_THRESHOLD_COUNT, REVIEW_THRESHOLD_PCT };
