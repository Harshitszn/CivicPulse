import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, ThumbsUp, ThumbsDown, MessageCircle, MapPin, Clock,
  Share2, CheckCircle2, Lock, AlertCircle, RefreshCw, Building2,
  History, ChevronDown, ChevronUp,
} from 'lucide-react';
import Badge, { StatusBadge, CategoryBadge, PriorityBadge } from '../../components/ui/Badge';
import StatusTimeline from '../../components/ui/StatusTimeline';
import CitizenVerificationCard from '../../components/ui/CitizenVerificationCard';
import Button from '../../components/ui/Button';
import { Textarea } from '../../components/ui/Input';
import { useToast } from '../../context/ToastContext';
import { usePincode } from '../../context/PincodeContext';
import { useAuth } from '../../context/AuthContext';
import ApiClient from '../../services/api';

function timeAgo(d) {
  if (!d) return 'recently';
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function StatusHistoryItem({ entry, isFirst }) {
  const fromLabel = entry.from_status || entry.old_status;
  const toLabel = entry.to_status || entry.new_status;
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className={`w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0 ${isFirst ? 'bg-secondary-400' : 'bg-primary-600'}`} />
        {!isFirst && <div className="w-px flex-1 bg-secondary-200 mt-1" />}
      </div>
      <div className="pb-4 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          {fromLabel && (
            <span className="text-[10px] bg-secondary-100 text-secondary-600 px-1.5 py-0.5 rounded font-semibold uppercase">{fromLabel}</span>
          )}
          {fromLabel && <span className="text-secondary-300 text-xs">→</span>}
          <span className="text-[10px] bg-primary-50 text-primary-700 border border-primary-200 px-1.5 py-0.5 rounded font-bold uppercase">{toLabel}</span>
        </div>
        <p className="text-[11px] text-secondary-500 mt-0.5">
          <span className="font-semibold text-secondary-700">{entry.changed_by_name || 'System'}</span>
          {entry.changed_by_role && entry.changed_by_role !== 'system' && (
            <span className="ml-1 text-primary-600 font-medium">({entry.changed_by_role})</span>
          )}
          {' · '}{timeAgo(entry.timestamp || entry.created_at)}
        </p>
        {entry.notes && (
          <p className="text-[11px] text-secondary-600 mt-0.5 italic">"{entry.notes}"</p>
        )}
      </div>
    </div>
  );
}

export default function ComplaintDetail() {
  const { id } = useParams();
  const { toast } = useToast();
  const { registeredPincode, isEligibleToVote } = usePincode();
  const { currentUser } = useAuth();

  // ── Data States ──────────────────────────────────────────────────────────
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);

  const [statusHistory, setStatusHistory] = useState([]);
  const [historyOpen, setHistoryOpen] = useState(false);

  // ── Vote State ────────────────────────────────────────────────────────────
  const [isVoting, setIsVoting] = useState(false);

  // ── Comment State ─────────────────────────────────────────────────────────
  const [commentText, setCommentText] = useState('');
  const [isAnonymousComment, setIsAnonymousComment] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ── Fetch Complaint ───────────────────────────────────────────────────────
  const fetchComplaint = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await ApiClient.getComplaintById(id);
      setComplaint(data);
    } catch (err) {
      setError(err.message || 'Failed to load complaint');
    } finally {
      setLoading(false);
    }
  }, [id]);

  // ── Fetch Comments ────────────────────────────────────────────────────────
  const fetchComments = useCallback(async () => {
    if (!id) return;
    setCommentsLoading(true);
    try {
      const data = await ApiClient.getComments(id);
      setComments(Array.isArray(data) ? data : []);
    } catch {
      setComments([]);
    } finally {
      setCommentsLoading(false);
    }
  }, [id]);

  // ── Fetch Status History ──────────────────────────────────────────────────
  const fetchStatusHistory = useCallback(async () => {
    if (!id) return;
    try {
      const data = await ApiClient.getStatusHistory(id);
      setStatusHistory(Array.isArray(data) ? data : []);
    } catch {
      setStatusHistory([]);
    }
  }, [id]);

  useEffect(() => {
    fetchComplaint();
    fetchComments();
    fetchStatusHistory();
  }, [fetchComplaint, fetchComments, fetchStatusHistory]);

  // ── Derived vote values ───────────────────────────────────────────────────
  const upvotes = complaint?.upvotes_count ?? complaint?.upvotes ?? 0;
  const downvotes = complaint?.downvotes_count ?? complaint?.downvotes ?? 0;
  const netScore = complaint?.net_score ?? (upvotes - downvotes);
  const rawUserVote = complaint?.current_user_vote || complaint?.currentUserVote;
  const userVote = rawUserVote ? rawUserVote.toLowerCase() : null;
  const upvoted = userVote === 'upvote';
  const downvoted = userVote === 'downvote';

  const complaintPincode = complaint?.pincode;
  const isEligible = complaintPincode ? isEligibleToVote(complaintPincode) : false;

  // ── Vote Handler ──────────────────────────────────────────────────────────
  const handleVote = async (type) => {
    if (!isEligible) return;
    if (isVoting) return;
    const token = ApiClient.getToken();
    if (!token) {
      toast.info('Please log in to vote.');
      return;
    }
    try {
      setIsVoting(true);
      const res = await ApiClient.voteComplaint(id, type === 'upvote' ? 'UPVOTE' : 'DOWNVOTE');
      setComplaint((prev) => ({
        ...prev,
        upvotes_count: res.upvotes,
        upvotes: res.upvotes,
        downvotes_count: res.downvotes,
        downvotes: res.downvotes,
        net_score: res.net_score,
        current_user_vote: res.current_user_vote,
        currentUserVote: res.current_user_vote,
      }));
      const vote = res.current_user_vote?.toLowerCase();
      if (vote === 'upvote') toast.success('Upvote recorded.');
      else if (vote === 'downvote') toast.info('Downvote recorded.');
      else toast.info('Vote removed.');
    } catch (err) {
      toast.error(err.message || 'Voting failed');
    } finally {
      setIsVoting(false);
    }
  };

  // ── Comment Submission ────────────────────────────────────────────────────
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    const token = ApiClient.getToken();
    if (!token) {
      toast.info('Please log in to comment.');
      return;
    }
    setSubmitting(true);
    try {
      const newComment = await ApiClient.addComment(id, commentText.trim(), isAnonymousComment);
      if (newComment) {
        setComments((prev) => [
          ...prev,
          {
            ...newComment,
            _id: newComment.id || newComment._id,
            author: {
              name: isAnonymousComment ? 'Anonymous Resident' : (currentUser?.name || currentUser?.full_name || 'You'),
              isOfficial: currentUser?.role === 'official' || currentUser?.role === 'admin',
            },
            content: commentText.trim(),
            createdAt: new Date().toISOString(),
          },
        ]);
        setCommentText('');
        toast.success('Comment posted!');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Loading State ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto pb-12 animate-fade-in">
        <Link to="/feed" className="inline-flex items-center gap-1.5 text-xs font-semibold text-secondary-500 hover:text-primary-600 mb-4 no-underline transition-colors">
          <ArrowLeft size={14} /> Back to Feed
        </Link>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-secondary-200 rounded-xl h-24 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="w-full max-w-4xl mx-auto pb-12 animate-fade-in">
        <Link to="/feed" className="inline-flex items-center gap-1.5 text-xs font-semibold text-secondary-500 hover:text-primary-600 mb-4 no-underline transition-colors">
          <ArrowLeft size={14} /> Back to Feed
        </Link>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <AlertCircle size={28} className="text-red-400 mx-auto mb-2" />
          <p className="text-sm font-bold text-red-700">{error || 'Complaint not found'}</p>
          <button onClick={fetchComplaint} className="mt-3 text-xs font-semibold text-primary-600 hover:underline flex items-center gap-1 mx-auto">
            <RefreshCw size={12} /> Retry
          </button>
        </div>
      </div>
    );
  }

  const imageUrl = complaint.imageUrl || (complaint.image_urls && complaint.image_urls[0]) || null;
  const reportedBy = complaint.reportedBy || {};
  const department = complaint.department || complaint.assigned_department || 'Municipal Works';

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
          <CategoryBadge category={complaint.categorySlug || complaint.category} />
          <StatusBadge status={complaint.status} />
          <PriorityBadge priority={complaint.priority} />
        </div>
        <h1 className="text-lg font-bold text-secondary-900 leading-snug">{complaint.title}</h1>
        <div className="flex items-center gap-3 mt-2 text-xs text-secondary-400 flex-wrap">
          <span className="flex items-center gap-1 font-medium text-secondary-700">
            <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden">
              {reportedBy.avatar ? (
                <img src={reportedBy.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-[9px] text-primary-700 font-bold">
                  {reportedBy.isAnonymous ? 'A' : (reportedBy.name?.charAt(0) || 'U')}
                </span>
              )}
            </div>
            {reportedBy.isAnonymous ? 'Anonymous Resident' : (reportedBy.name || 'Citizen')}
          </span>
          <span className="flex items-center gap-0.5"><Clock size={10} />{timeAgo(complaint.created_at || complaint.createdAt)}</span>
          <span className="flex items-center gap-0.5 font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded border border-primary-200">
            <MapPin size={10} />
            PIN: {complaint.pincode}
          </span>
          <span className="flex items-center gap-0.5 text-secondary-500">
            <Building2 size={10} />
            {department}
          </span>
        </div>
      </div>

      {/* Photo Preview */}
      {imageUrl && (
        <div className="mb-4 rounded-xl overflow-hidden border border-secondary-200 aspect-video bg-black shadow-card">
          <img src={imageUrl} alt={complaint.title} className="w-full h-full object-cover" />
        </div>
      )}

      {/* Description */}
      <div className="bg-surface border border-secondary-200 rounded-xl p-4 mb-4 shadow-card">
        <p className="text-xs text-secondary-700 whitespace-pre-line leading-relaxed">
          {complaint.description}
        </p>
        {complaint.estimated_resolution_time && (
          <p className="mt-3 text-xs text-amber-800 bg-amber-50 px-2.5 py-1.5 rounded border border-amber-200 inline-flex items-center gap-1.5 font-medium">
            <Clock size={11} className="text-amber-600" />
            Estimated Resolution: <strong>{complaint.estimated_resolution_time}</strong>
          </p>
        )}
      </div>

      {/* Vote Controls */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-secondary-100/90 rounded-xl p-1 border border-secondary-200">
            <button
              onClick={() => handleVote('upvote')}
              disabled={!isEligible || isVoting}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all min-h-[40px] ${
                !isEligible ? 'opacity-40 cursor-not-allowed text-secondary-400'
                  : upvoted ? 'bg-primary-600 text-white shadow-sm scale-95'
                  : 'bg-white text-secondary-700 hover:text-primary-600 hover:bg-secondary-50'
              }`}
              title={isEligible ? (upvoted ? 'Remove upvote' : 'Upvote issue') : `Only residents of ${complaintPincode} can vote`}
            >
              <ThumbsUp size={15} fill={upvoted ? 'currentColor' : 'none'} />
              <span>{upvotes} Upvotes</span>
            </button>

            <div className="px-3 text-center" title="Net Score = Upvotes - Downvotes">
              <span className={`text-xs font-extrabold block ${netScore > 0 ? 'text-primary-700' : netScore < 0 ? 'text-red-600' : 'text-secondary-600'}`}>
                {netScore > 0 ? `+${netScore}` : netScore}
              </span>
              <span className="text-[9px] text-secondary-400 font-semibold uppercase tracking-tighter">Net Score</span>
            </div>

            <button
              onClick={() => handleVote('downvote')}
              disabled={!isEligible || isVoting}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all min-h-[40px] ${
                !isEligible ? 'opacity-40 cursor-not-allowed text-secondary-400'
                  : downvoted ? 'bg-red-500 text-white shadow-sm scale-95'
                  : 'bg-white text-secondary-700 hover:text-red-500 hover:bg-secondary-50'
              }`}
              title={isEligible ? (downvoted ? 'Remove downvote' : 'Downvote issue') : `Only residents of ${complaintPincode} can vote`}
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
            <span>Only residents of this pincode ({complaintPincode}) can vote. (Your registered pincode: {registeredPincode})</span>
          </div>
        )}
      </div>

      {/* 5-Stage Status Timeline */}
      <StatusTimeline currentStatus={complaint.status} className="mb-5" />

      {/* Citizen Verification Card */}
      <CitizenVerificationCard
        complaintId={complaint.id || complaint._id}
        complaintPincode={complaint.pincode}
        status={complaint.status}
        className="mb-5"
      />


      {/* Status Change History (Collapsible) */}
      {statusHistory.length > 0 && (
        <div className="bg-surface border border-secondary-200 rounded-xl mb-5 shadow-card overflow-hidden">
          <button
            onClick={() => setHistoryOpen((o) => !o)}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-secondary-50 transition-colors"
          >
            <span className="text-sm font-extrabold text-secondary-900 flex items-center gap-2">
              <History size={16} className="text-primary-600" />
              Status Change History ({statusHistory.length} events)
            </span>
            {historyOpen ? <ChevronUp size={16} className="text-secondary-400" /> : <ChevronDown size={16} className="text-secondary-400" />}
          </button>

          {historyOpen && (
            <div className="px-4 pb-4 border-t border-secondary-100 pt-4">
              {statusHistory.map((entry, idx) => (
                <StatusHistoryItem key={entry.id || idx} entry={entry} isFirst={idx === statusHistory.length - 1} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Community Discussion & Comments */}
      <div className="bg-surface border border-secondary-200 rounded-xl p-5 shadow-card space-y-4">
        <div className="flex items-center justify-between border-b border-secondary-100 pb-3">
          <h3 className="text-sm font-extrabold text-secondary-900 flex items-center gap-2">
            <MessageCircle size={17} className="text-primary-600" />
            Community Discussion ({comments.length})
          </h3>
          {commentsLoading && (
            <span className="text-xs text-secondary-400 flex items-center gap-1">
              <RefreshCw size={11} className="animate-spin" /> Loading...
            </span>
          )}
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
            <div className="flex items-center gap-3">
              <label className="text-xs font-medium text-secondary-600 flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="commentAnon"
                  checked={!isAnonymousComment}
                  onChange={() => setIsAnonymousComment(false)}
                  className="accent-primary-600"
                />
                <span>Public ({currentUser?.name || currentUser?.full_name || 'You'})</span>
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
              disabled={!commentText.trim() || submitting || !ApiClient.getToken()}
              className="font-bold text-xs px-4"
              title={!ApiClient.getToken() ? 'Log in to comment' : (!commentText.trim() ? 'Type a comment before posting' : '')}
            >
              {submitting ? 'Posting...' : 'Post Comment'}
            </Button>
          </div>
          {!ApiClient.getToken() && (
            <p className="text-[11px] text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-200">
              <Lock size={10} className="inline mr-1" />
              <Link to="/login" className="font-bold text-primary-600 hover:underline">Log in</Link> to join the discussion.
            </p>
          )}
        </form>

        {/* Comments List */}
        <div className="space-y-3 pt-2">
          {comments.map((c, idx) => {
            const isOfficial = c.is_official || c.author?.isOfficial;
            const authorName = c.is_anonymous ? 'Anonymous Resident' : (c.author?.name || c.user_name || c.author_name || 'Resident');
            return (
              <div
                key={c.id || c._id || idx}
                className={`p-3.5 rounded-xl border transition-all text-xs ${
                  isOfficial ? 'bg-blue-50/80 border-blue-200' : 'bg-white border-secondary-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs overflow-hidden flex-shrink-0 ${
                      isOfficial ? 'bg-primary-600 text-white' : 'bg-primary-100 text-primary-700'
                    }`}>
                      {c.author?.avatar ? (
                        <img src={c.author.avatar} alt={authorName} className="w-full h-full object-cover" />
                      ) : (
                        <span>{authorName.charAt(0)}</span>
                      )}
                    </div>
                    <div>
                      <span className="font-bold text-secondary-900 block leading-tight">{authorName}</span>
                      {isOfficial && (
                        <span className="inline-block mt-0.5 px-1.5 py-0.5 bg-primary-600 text-white text-[9px] font-extrabold rounded">
                          OFFICIAL MUNICIPAL UPDATE
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] text-secondary-400 font-medium">{timeAgo(c.created_at || c.createdAt)}</span>
                </div>
                <p className="text-secondary-700 leading-relaxed pl-9 whitespace-pre-line">{c.content}</p>
              </div>
            );
          })}

          {comments.length === 0 && !commentsLoading && (
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
