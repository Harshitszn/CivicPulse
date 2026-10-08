/**
 * Vote Controller
 */
const VoteModel = require('../models/Vote');
const { ApiResponse } = require('../utils/ApiResponse');

const castVote = async (req, res, next) => {
  try {
    const { complaintId } = req.params;
    const rawVoteType = req.body.vote_type || req.body.voteType || req.body.type || req.body.vote;

    const result = await VoteModel.castVote({
      userId: req.user.id,
      complaintId,
      rawVoteType,
      userPincode: req.user.pincode,
    });
    return ApiResponse.ok(res, result, 'Vote recorded successfully');
  } catch (err) {
    next(err);
  }
};

const getUserVote = async (req, res, next) => {
  try {
    const { complaintId } = req.params;
    const vote = await VoteModel.findUserVote(req.user.id, complaintId);
    return ApiResponse.ok(res, {
      vote: vote || null,
      current_user_vote: vote?.vote_type ? vote.vote_type.toUpperCase() : null,
      currentUserVote: vote?.vote_type ? vote.vote_type.toUpperCase() : null,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  castVote,
  getUserVote,
};
