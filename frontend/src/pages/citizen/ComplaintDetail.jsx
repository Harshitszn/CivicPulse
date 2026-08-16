import React, { useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import {
  ArrowLeft, ThumbsUp, ThumbsDown, MessageCircle, MapPin, Clock,
  Share2, Flag, CheckCircle2, Clock3, AlertCircle, XCircle, Lock,
} from 'lucide-react';
import Badge, { StatusBadge, CategoryBadge, PriorityBadge } from '../../components/ui/Badge';
import StatusTimeline from '../../components/ui/StatusTimeline';
import CitizenVerificationCard from '../../components/ui/CitizenVerificationCard';
import Button from '../../components/ui/Button';
import { Textarea } from '../../components/ui/Input';
import { useToast } from '../../context/ToastContext';
import { usePincode } from '../../context/PincodeContext';

const MOCK_COMPLAINT = {
  _id: '1',
  title: 'Giant pothole on MG Road near bus stop causing accidents',
  description: `There is a massive pothole measuring approximately 3 feet wide and 6 inches deep near the City Bus Stop 12 on MG Road. This pothole has been present for over two weeks now and has caused multiple two-wheeler accidents. Residents in the area are extremely concerned about their safety.\n\nThe pothole appears to have developed due to recent rain and poor road quality. Multiple vehicles have already suffered tyre damage. The area is heavily trafficked and is near a school zone.`,
  category: 'roads', status: 'in_progress', priority: 'high',
  upvotes: 128, downvotes: 4, commentCount: 23,
  location: { address: 'MG Road, near Bus Stop 12', pincode: '560001', ward: 'Ward 47', city: 'Bengaluru' },
  reportedBy: { name: 'Priya Sharma', avatar: null },
  assignedTo: { name: 'Roads & Infrastructure Dept.' },
  createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  images: [],
  isVerified: false,
};

const STATUS_TIMELINE = [
  { status: 'open',        label: 'Reported',    date: '2 hours ago',  done: true  },
  { status: 'acknowledged',label: 'Acknowledged', date: '1 hour ago',   done: true  },
  { status: 'in_progress', label: 'In Progress',  date: '30 mins ago',  done: true  },
  { status: 'resolved',    label: 'Resolved',     date: 'Pending',      done: false },
];

const MOCK_COMMENTS = [
  { _id: 'c1', author: { name: 'Ravi Kumar', role: 'citizen' }, content: 'I also witnessed an accident here yesterday. This needs immediate fixing!', createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(), isOfficialUpdate: false },
  { _id: 'c2', author: { name: 'Roads Dept. Officer', role: 'municipal_officer' }, content: 'We have received your complaint and a site inspection has been scheduled for tomorrow morning. Work order has been issued.', createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), isOfficialUpdate: true },
  { _id: 'c3', author: { name: 'Meena S.', role: 'citizen' }, content: 'Thank you for the quick response! We really appreciate it.', createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(), isOfficialUpdate: false },
];

function timeAgo(d) {
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

export default function ComplaintDetail() {
  const { id } = useParams();
  const location = useLocation();
  const { toast } = useToast();
  const { registeredPincode, isEligibleToVote, castVote, getComplaintVotes, getComplaintComments, addComment, allComplaints } = usePincode();

  const activeComplaint = React.useMemo(() => {
    if (allComplaints) {
      const found = allComplaints.find((item) => String(item._id) === String(id));
      if (found) return found;
    }
    if (location.state?.complaint) return location.state.complaint;
    return MOCK_COMPLAINT;
  }, [allComplaints, id, location.state]);

  const isEligible = isEligibleToVote(activeComplaint.pincode);
  const { upvotes, downvotes, netScore, userVote } = getComplaintVotes(
    activeComplaint._id,
    activeComplaint.upvotes,
    activeComplaint.downvotes
  );

  const upvoted = userVote === 'upvote';
  const downvoted = userVote === 'downvote';

  const { comments, count: commentCount } = getComplaintComments(activeComplaint._id, activeComplaint.commentCount || 0);

  const [commentText, setCommentText] = useState('');
  const [isAnonymousComment, setIsAnonymousComment] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleUpvote = () => {
    castVote(activeComplaint._id, activeComplaint.pincode, 'upvote');
  };

  const handleDownvote = () => {
    castVote(activeComplaint._id, activeComplaint.pincode, 'downvote');
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 400));

    addComment(activeComplaint._id, {
      content: commentText,
      isAnonymous: isAnonymousComment,
      authorName: 'Priya Sharma',
    });

    setCommentText('');
    setSubmitting(false);
  };

  return (
    <div className="animate-fade-in w-full max-w-4xl mx-auto pb-12">
      {/* Back Link */}
      <Link to="/feed" className="inline-flex items-center gap-1.5 text-xs font-semibold text-secondary-500 hover:text-primary-600 mb-4 no-underline transition-colors">
        <ArrowLeft size={14} />
        Back to Feed
      </Link>

      {/* Complaint Header */}
      <div className="mb-4">
        <div className="flex items-center gap-2 flex-wrap mb-2">
          <CategoryBadge category={activeComplaint.categorySlug || activeComplaint.category} />
          <StatusBadge status={activeComplaint.status} />
          <PriorityBadge priority={activeComplaint.priority} />
        </div>
        <h1 className="text-lg font-bold text-secondary-900 leading-snug">{activeComplaint.title}</h1>
        <div className="flex items-center gap-3 mt-2 text-xs text-secondary-400">
          <span className="flex items-center gap-1 font-medium text-secondary-700">
            <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden">
              {activeComplaint.reportedBy?.avatar ? (
                <img src={activeComplaint.reportedBy.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-[9px] text-primary-700 font-bold">
                  {activeComplaint.reportedBy?.isAnonymous ? 'A' : (activeComplaint.reportedBy?.name?.charAt(0) || 'U')}
                </span>
              )}
            </div>
            {activeComplaint.reportedBy?.isAnonymous ? 'Anonymous Resident' : (activeComplaint.reportedBy?.name || 'Citizen')}
          </span>
          <span className="flex items-center gap-0.5"><Clock size={10} />{timeAgo(activeComplaint.createdAt)}</span>
          <span className="flex items-center gap-0.5 font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded border border-primary-200">
            <MapPin size={10} />
            PIN: {activeComplaint.pincode}
          </span>
        </div>
      </div>

      {/* Photo Preview if attached */}
      {activeComplaint.imageUrl && (
        <div className="mb-4 rounded-xl overflow-hidden border border-secondary-200 aspect-video bg-black shadow-card">
          <img src={activeComplaint.imageUrl} alt={activeComplaint.title} className="w-full h-full object-cover" />
        </div>
      )}

      {/* Description Body */}
      <div className="bg-surface border border-secondary-200 rounded-xl p-4 mb-4 shadow-card">
        <p className="text-xs text-secondary-700 whitespace-pre-line leading-relaxed">
          {activeComplaint.description}
        </p>
      </div>

      {/* Vote + Share Controls */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          {/* Voting Action Group */}
          <div className="flex items-center bg-secondary-100/90 rounded-xl p-1 border border-secondary-200">
            {/* Upvote Button */}
            <button
              onClick={handleUpvote}
              disabled={!isEligible}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all min-h-[40px] ${
                !isEligible
                  ? 'opacity-40 cursor-not-allowed text-secondary-400'
                  : upvoted
                  ? 'bg-primary-600 text-white shadow-sm scale-95'
                  : 'bg-white text-secondary-700 hover:text-primary-600 hover:bg-secondary-50'
              }`}
              title={isEligible ? (upvoted ? 'Remove upvote' : 'Upvote issue') : `Only residents of ${activeComplaint.pincode} can vote`}
            >
              <ThumbsUp size={15} fill={upvoted ? 'currentColor' : 'none'} />
              <span>{upvotes} Upvotes</span>
            </button>

            {/* Net Score Badge */}
            <div className="px-3 text-center" title="Net Score = Upvotes - Downvotes">
              <span className={`text-xs font-extrabold block ${netScore > 0 ? 'text-primary-700' : netScore < 0 ? 'text-error' : 'text-secondary-600'}`}>
                {netScore > 0 ? `+${netScore}` : netScore}
              </span>
              <span className="text-[9px] text-secondary-400 font-semibold uppercase tracking-tighter">Net Score</span>
            </div>

            {/* Downvote Button */}
            <button
              onClick={handleDownvote}
              disabled={!isEligible}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all min-h-[40px] ${
                !isEligible
                  ? 'opacity-40 cursor-not-allowed text-secondary-400'
                  : downvoted
                  ? 'bg-error text-white shadow-sm scale-95'
                  : 'bg-white text-secondary-700 hover:text-error hover:bg-secondary-50'
              }`}
              title={isEligible ? (downvoted ? 'Remove downvote' : 'Downvote issue') : `Only residents of ${activeComplaint.pincode} can vote`}
            >
              <ThumbsDown size={15} fill={downvoted ? 'currentColor' : 'none'} />
              <span>{downvotes} Downvotes</span>
            </button>
          </div>

          <button className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-secondary-700 border border-secondary-200 bg-white hover:bg-secondary-50 transition-colors min-h-[44px]">
            <Share2 size={15} />
            Share
          </button>
        </div>

        {!isEligible && (
          <div className="mt-2.5 flex items-center gap-1.5 text-xs font-medium text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
            <Lock size={13} className="text-amber-600 flex-shrink-0" />
            <span>Only residents of this pincode ({activeComplaint.pincode}) can vote on this issue. (Your pincode: {registeredPincode})</span>
          </div>
        )}
      </div>

      {/* Reusable 5-Stage Status Timeline Component */}
      <StatusTimeline currentStatus={activeComplaint.status} className="mb-5" />

      {/* Citizen Status Verification (Displays when In Progress or Resolved) */}
      <CitizenVerificationCard complaintId={activeComplaint._id} status={activeComplaint.status} className="mb-5" />

      {/* ── Community Discussion & Comments Section ──────────────────────── */}
      <div className="bg-surface border border-secondary-200 rounded-xl p-5 shadow-card space-y-4">
        <div className="flex items-center justify-between border-b border-secondary-100 pb-3">
          <h3 className="text-sm font-extrabold text-secondary-900 flex items-center gap-2">
            <MessageCircle size={17} className="text-primary-600" />
            Community Discussion ({commentCount})
          </h3>
          <span className="text-xs text-secondary-400">Reddit-style linear feed</span>
        </div>

        {/* Comment Composer */}
        <form onSubmit={handleCommentSubmit} className="space-y-3 bg-secondary-50/60 p-3.5 rounded-xl border border-secondary-200">
          <Textarea
            placeholder="Add a community observation or update..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            rows={3}
            id="complaint-comment"
            maxLength={500}
          />
          <div className="flex items-center justify-between text-[10px] text-secondary-400 font-medium -mt-1">
            <span />
            <span>{commentText.length}/500</span>
          </div>

          <div className="flex items-center justify-between flex-wrap gap-2">
            {/* Identity toggle */}
            <div className="flex items-center gap-3">
              <label className="text-xs font-medium text-secondary-600 flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="commentAnon"
                  checked={!isAnonymousComment}
                  onChange={() => setIsAnonymousComment(false)}
                  className="accent-primary-600"
                />
                <span>Public (Priya Sharma)</span>
              </label>

              <label className="text-xs font-medium text-secondary-600 flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="commentAnon"
                  checked={isAnonymousComment}
                  onChange={() => setIsAnonymousComment(true)}
                  className="accent-primary-600"
                />
                <span>Anonymous Resident</span>
              </label>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={submitting}
              disabled={!commentText.trim() || submitting}
              className="font-bold text-xs px-4"
              title={!commentText.trim() ? 'Type a comment before posting' : ''}
            >
              {submitting ? 'Posting...' : 'Post Comment'}
            </Button>
          </div>
        </form>

        {/* Comments List */}
        <div className="space-y-3 pt-2">
          {comments.map((c) => (
            <div
              key={c._id}
              className={`p-3.5 rounded-xl border transition-all text-xs ${
                c.author?.isOfficial
                  ? 'bg-blue-50/80 border-blue-200'
                  : 'bg-white border-secondary-200'
              }`}
            >
              {/* Comment Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs overflow-hidden flex-shrink-0 ${
                    c.author?.isOfficial ? 'bg-primary-600 text-white' : 'bg-primary-100 text-primary-700'
                  }`}>
                    {c.author?.avatar ? (
                      <img src={c.author.avatar} alt={c.author.name} className="w-full h-full object-cover" />
                    ) : (
                      <span>{c.author?.name ? c.author.name.charAt(0) : 'A'}</span>
                    )}
                  </div>

                  <div>
                    <span className="font-bold text-secondary-900 block leading-tight">
                      {c.author?.name || 'Resident'}
                    </span>
                    {c.author?.isOfficial && (
                      <span className="inline-block mt-0.5 px-1.5 py-0.5 bg-primary-600 text-white text-[9px] font-extrabold rounded">
                        OFFICIAL MUNICIPAL UPDATE
                      </span>
                    )}
                  </div>
                </div>

                <span className="text-[10px] text-secondary-400 font-medium">
                  {timeAgo(c.createdAt)}
                </span>
              </div>

              {/* Comment Text */}
              <p className="text-secondary-700 leading-relaxed pl-9 whitespace-pre-line">
                {c.content}
              </p>
            </div>
          ))}

          {comments.length === 0 && (
            <div className="flex flex-col items-center py-8 text-center gap-2">
              <div className="w-12 h-12 rounded-full bg-secondary-100 flex items-center justify-center mb-1">
                <MessageCircle size={22} className="text-secondary-400" />
              </div>
              <p className="text-sm font-bold text-secondary-500">No comments yet</p>
              <p className="text-xs text-secondary-400">Be the first to start the community discussion!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
