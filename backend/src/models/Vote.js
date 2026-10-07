/**
 * Vote Data Access Model
 */
const { db } = require('../config/database');

const TABLE = 'votes';

class VoteModel {
  static async findUserVote(userId, complaintId) {
    return db(TABLE).where({ user_id: userId, complaint_id: complaintId }).first();
  }

  static async castVote(userId, complaintId, voteType) {
    return db.transaction(async (trx) => {
      const existing = await trx(TABLE)
        .where({ user_id: userId, complaint_id: complaintId })
        .first();

      if (existing) {
        if (existing.vote_type === voteType) {
          // Remove vote (toggle off)
          await trx(TABLE).where({ id: existing.id }).del();
          const col = voteType === 'upvote' ? 'upvotes_count' : 'downvotes_count';
          await trx('complaints')
            .where({ id: complaintId })
            .decrement(col, 1);
          return { action: 'removed', voteType: null };
        } else {
          // Switch vote
          await trx(TABLE).where({ id: existing.id }).update({ vote_type: voteType });
          const incCol = voteType === 'upvote' ? 'upvotes_count' : 'downvotes_count';
          const decCol = voteType === 'upvote' ? 'downvotes_count' : 'upvotes_count';
          await trx('complaints').where({ id: complaintId }).increment(incCol, 1).decrement(decCol, 1);
          return { action: 'switched', voteType };
        }
      } else {
        // Insert new vote
        await trx(TABLE).insert({ user_id: userId, complaint_id: complaintId, vote_type: voteType });
        const col = voteType === 'upvote' ? 'upvotes_count' : 'downvotes_count';
        await trx('complaints').where({ id: complaintId }).increment(col, 1);
        return { action: 'created', voteType };
      }
    });
  }
}

module.exports = VoteModel;
