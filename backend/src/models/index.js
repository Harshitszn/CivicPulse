/**
 * Central Models Export
 */
const UserModel = require('./User');
const ComplaintModel = require('./Complaint');
const VoteModel = require('./Vote');
const CommentModel = require('./Comment');
const WardModel = require('./Ward');

module.exports = {
  UserModel,
  ComplaintModel,
  VoteModel,
  CommentModel,
  WardModel,
};
