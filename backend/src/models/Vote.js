/**
 * Vote Data Access Model
 * Implements authoritative PostgreSQL vote tracking with pincode validation.
 */
const { db } = require('../config/database');
const ApiError = require('../utils/ApiError');

const TABLE = 'votes';

class VoteModel {
  static async findUserVote(userId, complaintId) {
    if (!userId || !complaintId) return null;
    return db(TABLE).where({ user_id: userId, complaint_id: complaintId }).first();
  }

  static async findUserVotesForComplaints(userId, complaintIds) {
    if (!userId || !complaintIds || complaintIds.length === 0) return {};
    const rows = await db(TABLE)
      .where({ user_id: userId })
      .whereIn('complaint_id', complaintIds)
      .select('complaint_id', 'vote_type');

    const map = {};
    for (const r of rows) {
      map[r.complaint_id] = r.vote_type ? r.vote_type.toUpperCase() : null;
    }
    return map;
  }

  /**
   * Cast, change, or remove a vote on a complaint.
   *
   * Rules:
   * 1. Authenticated users only.
   * 2. User's registered pincode must match complaint pincode.
   * 3. One active vote per user per complaint.
   * 4. User can change their vote (UPVOTE <-> DOWNVOTE).
   * 5. User can remove their vote (clicking same vote or passing REMOVE).
   * 6. Authoritative vote counts computed directly in PostgreSQL.
   */
  static async castVote({ userId, complaintId, rawVoteType, userPincode }) {
    if (!complaintId) {
      throw ApiError.badRequest('Complaint ID is required');
    }

    // 1. Fetch complaint and verify existence
    const complaint = await db('complaints').where({ id: complaintId }).first();
    if (!complaint) {
      throw ApiError.notFound('Complaint not found');
    }

    // 2. Fetch authenticated user's registered pincode if not provided
    let registeredPincode = userPincode;
    if (!registeredPincode) {
      const user = await db('users').where({ id: userId }).first();
      registeredPincode = user?.pincode;
    }

    if (!registeredPincode) {
      throw ApiError.forbidden('You must have a registered pincode on your profile to vote.');
    }

    // 3. Pincode validation: user registered pincode MUST match complaint pincode
    if (String(registeredPincode).trim() !== String(complaint.pincode).trim()) {
      throw ApiError.forbidden(
        `Voting is restricted to residents of this pincode (${complaint.pincode}). Your registered pincode is ${registeredPincode}.`
      );
    }

    // 4. Normalize voteType
    const voteInput = String(rawVoteType || '').trim().toUpperCase();
    if (!['UPVOTE', 'DOWNVOTE', 'REMOVE'].includes(voteInput)) {
      throw ApiError.badRequest("Invalid vote type. Allowed values are 'UPVOTE', 'DOWNVOTE', or 'REMOVE'.");
    }

    const targetType = voteInput === 'REMOVE' ? null : (voteInput === 'UPVOTE' ? 'upvote' : 'downvote');

    // 5. Execute atomic transaction in PostgreSQL
    return db.transaction(async (trx) => {
      const existingVote = await trx(TABLE)
        .where({ user_id: userId, complaint_id: complaintId })
        .first();

      let currentUserVote = null;

      if (!targetType) {
        // User explicitly wants to remove their vote
        if (existingVote) {
          await trx(TABLE).where({ id: existingVote.id }).del();
          const col = existingVote.vote_type === 'upvote' ? 'upvotes_count' : 'downvotes_count';
          await trx('complaints')
            .where({ id: complaintId })
            .decrement(col, 1);
        }
        currentUserVote = null;
      } else if (existingVote) {
        if (existingVote.vote_type.toLowerCase() === targetType.toLowerCase()) {
          // Toggle off: user voted the same type, so remove the vote
          await trx(TABLE).where({ id: existingVote.id }).del();
          const col = targetType === 'upvote' ? 'upvotes_count' : 'downvotes_count';
          await trx('complaints')
            .where({ id: complaintId })
            .decrement(col, 1);
          currentUserVote = null;
        } else {
          // Switch vote from UPVOTE to DOWNVOTE or vice versa
          await trx(TABLE)
            .where({ id: existingVote.id })
            .update({ vote_type: targetType, created_at: trx.fn.now() });

          const incCol = targetType === 'upvote' ? 'upvotes_count' : 'downvotes_count';
          const decCol = targetType === 'upvote' ? 'downvotes_count' : 'upvotes_count';
          await trx('complaints')
            .where({ id: complaintId })
            .increment(incCol, 1)
            .decrement(decCol, 1);

          currentUserVote = targetType.toUpperCase();
        }
      } else {
        // New vote
        await trx(TABLE).insert({
          user_id: userId,
          complaint_id: complaintId,
          vote_type: targetType,
          created_at: trx.fn.now(),
        });

        const col = targetType === 'upvote' ? 'upvotes_count' : 'downvotes_count';
        await trx('complaints')
          .where({ id: complaintId })
          .increment(col, 1);

        currentUserVote = targetType.toUpperCase();
      }

      // Read authoritative state from complaints table
      const updated = await trx('complaints').where({ id: complaintId }).first();
      const upvotes = Math.max(0, parseInt(updated.upvotes_count || 0, 10));
      const downvotes = Math.max(0, parseInt(updated.downvotes_count || 0, 10));
      const netScore = upvotes - downvotes;

      return {
        complaint_id: complaintId,
        upvotes,
        downvotes,
        net_score: netScore,
        current_user_vote: currentUserVote,
        // Aliases for compatibility
        upvotes_count: upvotes,
        downvotes_count: downvotes,
        netScore,
        currentUserVote,
      };
    });
  }
}

module.exports = VoteModel;
