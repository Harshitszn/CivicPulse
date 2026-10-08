/**
 * Comment Controller
 */
const CommentModel = require('../models/Comment');
const { ApiResponse } = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

const getComments = async (req, res, next) => {
  try {
    const { complaintId } = req.params;
    const comments = await CommentModel.findByComplaintId(complaintId);
    return ApiResponse.ok(res, comments);
  } catch (err) {
    next(err);
  }
};

const addComment = async (req, res, next) => {
  try {
    const { complaintId } = req.params;
    const { content, is_anonymous } = req.body;

    if (!content || !content.trim()) {
      throw ApiError.badRequest('Comment content cannot be empty');
    }

    const is_official = req.user.role === 'official' || req.user.role === 'admin';
    const comment = await CommentModel.create({
      user_id: req.user.id,
      complaint_id: complaintId,
      content: content.trim(),
      is_official,
      is_anonymous: Boolean(is_anonymous),
    });

    return ApiResponse.created(res, comment, 'Comment added');
  } catch (err) {
    next(err);
  }
};

const deleteComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await CommentModel.delete(id, req.user.id);
    if (!deleted) {
      throw ApiError.notFound('Comment not found or unauthorized');
    }
    return ApiResponse.ok(res, null, 'Comment deleted');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getComments,
  addComment,
  deleteComment,
};
