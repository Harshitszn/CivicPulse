/**
 * Comment Data Access Model
 */
const { db } = require('../config/database');

const TABLE = 'comments';

class CommentModel {
  static async findByComplaintId(complaintId) {
    return db(TABLE)
      .join('users', 'comments.user_id', '=', 'users.id')
      .where('comments.complaint_id', complaintId)
      .select(
        'comments.*',
        'users.full_name as author_name',
        'users.role as author_role',
        'users.avatar_url as author_avatar'
      )
      .orderBy('comments.created_at', 'asc');
  }

  static async create({ user_id, complaint_id, content, is_official = false, is_anonymous = false }) {
    const [comment] = await db(TABLE)
      .insert({
        user_id,
        complaint_id,
        content,
        is_official,
        is_anonymous,
      })
      .returning('*');
    return comment;
  }

  static async delete(id, userId, isAdmin = false) {
    let query = db(TABLE).where({ id });
    if (!isAdmin) {
      query = query.where({ user_id: userId });
    }
    return query.del();
  }
}

module.exports = CommentModel;
