/**
 * Vote Controller
 */
const VoteModel = require('../models/Vote');
const { ApiResponse } = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

const castVote = async (req, res, next) => {
  try {
    const { complaintId } = req.params;
    const { voteType } = req.body;

    if (!['upvote', 'downvote'].includes(voteType)) {
      throw ApiError.badRequest("voteType must be 'upvote' or 'downvote'");
    }

    const result = await VoteModel.castVote(req.user.id, complaintId, voteType);
    return ApiResponse.ok(res, result, `Vote ${result.action}`);
  } catch (err) {
    next(err);
  }
};

const getUserVote = async (req, res, next) => {
  try {
    const { complaintId } = req.params;
    const vote = await VoteModel.findUserVote(req.user.id, complaintId);
    return ApiResponse.ok(res, { vote: vote || null });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  castVote,
  getUserVote,
};
