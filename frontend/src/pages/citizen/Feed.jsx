import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ThumbsUp, ThumbsDown, MessageCircle, MapPin, Clock, Flame,
  Clock3, TrendingUp, AlertTriangle, Building2, Share2, Bookmark, CheckCircle2,
  Lock, Filter, Eye, Sparkles, RefreshCw,
} from 'lucide-react';
import { StatusBadge, CategoryBadge, PriorityBadge } from '../../components/ui/Badge';
import StatusTimeline from '../../components/ui/StatusTimeline';
import { FeedCardSkeleton } from '../../components/ui/LoadingSpinner';
import { usePincode } from '../../context/PincodeContext';
import ApiClient from '../../services/api';

const SORT_TABS = [
  { id: 'top', label: 'Top', icon: TrendingUp },
  { id: 'new', label: 'New', icon: Clock3 },
  { id: 'urgent', label: 'Most Urgent', icon: AlertTriangle },
  { id: 'discussed', label: 'Most Discussed', icon: MessageCircle },
];

const FILTER_CATEGORIES = [
  { id: 'all', label: 'All Categories' },
  { id: 'roads', label: 'Roads' },
  { id: 'garbage', label: 'Garbage' },
  { id: 'water', label: 'Water' },
  { id: 'drainage', label: 'Drainage' },
  { id: 'streetlights', label: 'Street Lighting' },
  { id: 'infra', label: 'Public Infrastructure' },
];

function timeAgo(dateStr) {
  if (!dateStr) return 'recently';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

// ── Single Visual Post Component ─────────────────────────────────────────────
function VisualPostCard({ complaint, onVoteUpdated }) {
  const { registeredPincode, isEligibleToVote, castVote, getComplaintComments } = usePincode();
  const [saved, setSaved] = useState(false);
  const [isVoting, setIsVoting] = useState(false);

  const complaintId = complaint.id || complaint._id;
  const isEligible = isEligibleToVote(complaint.pincode);

  // Authoritative vote values directly from complaint (persisted in PostgreSQL)
  const upvotes = complaint.upvotes_count !== undefined ? complaint.upvotes_count : (complaint.upvotes || 0);
  const downvotes = complaint.downvotes_count !== undefined ? complaint.downvotes_count : (complaint.downvotes || 0);
  const netScore = complaint.net_score !== undefined ? complaint.net_score : (upvotes - downvotes);

  const rawUserVote = complaint.current_user_vote || complaint.currentUserVote;
  const userVote = rawUserVote ? rawUserVote.toLowerCase() : null;

  const upvoted = userVote === 'upvote';
  const downvoted = userVote === 'downvote';

  const { count: commentCount } = getComplaintComments(complaintId, complaint.commentCount || 0);

  const handleVote = async (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    if (isVoting) return;

    if (!isEligible) return;

    try {
      setIsVoting(true);
      const res = await castVote(complaintId, complaint.pincode, type);
      if (res && onVoteUpdated) {
        onVoteUpdated(complaintId, res);
      }
    } finally {
      setIsVoting(false);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setSaved((s) => !s);
  };

  const reportedBy = complaint.reportedBy || {
    name: (complaint.is_anonymous || complaint.isAnonymous) ? 'Anonymous Resident' : (complaint.author_name || 'Citizen Resident'),
    avatar: (complaint.is_anonymous || complaint.isAnonymous) ? null : (complaint.author_avatar || null),
    isAnonymous: Boolean(complaint.is_anonymous || complaint.isAnonymous),
  };

  const department = complaint.department || complaint.assigned_department || 'Public Works Department';
  const createdAt = complaint.created_at || complaint.createdAt || new Date().toISOString();
  const imageUrl = complaint.imageUrl || (complaint.image_urls && complaint.image_urls[0]) || null;
  const categorySlug = complaint.categorySlug || complaint.category?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'other';

  return (
    <article className="bg-surface border border-secondary-200 rounded-xl shadow-card hover:shadow-raised transition-all duration-normal overflow-hidden mb-5">
      {/* Post Header: User info + Status badge */}
      <div className="p-4 flex items-center justify-between border-b border-secondary-100/80 bg-white">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-primary-100 border border-primary-200 flex items-center justify-center overflow-hidden flex-shrink-0">
            {reportedBy.avatar ? (
              <img src={reportedBy.avatar} alt={reportedBy.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-primary-700 font-bold text-sm">
                {reportedBy.isAnonymous ? 'A' : reportedBy.name.charAt(0)}
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-secondary-900 leading-tight">
                {reportedBy.isAnonymous ? 'Anonymous Resident' : reportedBy.name}
              </span>
              <span className="text-xs text-secondary-400">• {timeAgo(createdAt)}</span>
            </div>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-secondary-400">
              <span className="flex items-center gap-1 font-semibold text-primary-700 bg-primary-50 px-2 py-0.5 rounded border border-primary-200">
                <MapPin size={12} className="text-primary-600" />
                PIN: {complaint.pincode} ({complaint.ward || 'Local Ward'})
              </span>
            </div>
          </div>
        </div>

        <StatusBadge status={complaint.status} />
      </div>

      {/* Post Title & Description */}
      <div className="p-4 pb-3">
        <Link to={`/complaint/${complaintId}`} className="no-underline group">
          <h2 className="text-base font-bold text-secondary-900 group-hover:text-primary-600 transition-colors leading-snug mb-1.5">
            {complaint.title}
          </h2>
        </Link>
        <p className="text-xs text-secondary-600 leading-relaxed line-clamp-2">
          {complaint.description}
        </p>
      </div>

      {/* Large Issue Image */}
      {imageUrl && (
        <Link to={`/complaint/${complaintId}`} className="block relative bg-secondary-100 aspect-video overflow-hidden">
          <img
            src={imageUrl}
            alt={complaint.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-slow"
            loading="lazy"
          />
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <CategoryBadge category={categorySlug} />
            <PriorityBadge priority={complaint.priority} />
          </div>
        </Link>
      )}

      {/* Metadata Strip: Department & Pincode */}
      <div className="px-4 py-2.5 bg-secondary-50/80 border-t border-b border-secondary-100 flex items-center justify-between text-xs text-secondary-500">
        <span className="flex items-center gap-1.5 font-medium truncate">
          <Building2 size={13} className="text-primary-600 flex-shrink-0" />
          Assigned: <strong className="text-secondary-800 font-semibold">{department}</strong>
        </span>
        <span className="text-[11px] bg-white px-2 py-0.5 rounded border border-secondary-200 text-secondary-600 font-mono font-bold">
          📍 {complaint.pincode}
        </span>
      </div>

      {/* 5-Stage Status Tracking Stepper */}
      <div className="px-4 py-2.5 bg-white border-b border-secondary-100/80">
        <StatusTimeline currentStatus={complaint.status} compact />
      </div>

      {/* Post Footer Action Bar: Upvote, Downvote, Net Score */}
      <div className="px-4 py-3 bg-white">
        <div className="flex items-center justify-between">
          {/* Voting Controls: Upvote count + Downvote count + Net Score */}
          <div className="flex items-center bg-secondary-100/90 rounded-lg p-1 border border-secondary-200/80">
            {/* Upvote Button */}
            <button
              onClick={(e) => handleVote(e, 'upvote')}
              disabled={!isEligible || isVoting}
              aria-label="Upvote issue"
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-bold transition-all min-h-[34px] ${
                !isEligible
                  ? 'opacity-40 cursor-not-allowed text-secondary-400'
                  : upvoted
                  ? 'bg-primary-600 text-white shadow-sm scale-95'
                  : 'text-secondary-600 hover:text-primary-600 hover:bg-white'
              }`}
              title={isEligible ? (upvoted ? 'Click to remove upvote' : 'Upvote this issue') : `Only residents of ${complaint.pincode} can vote`}
            >
              <ThumbsUp size={13} fill={upvoted ? 'currentColor' : 'none'} />
              <span>{upvotes}</span>
            </button>

            {/* Net Score Badge */}
            <div
              className="px-2.5 text-xs font-extrabold flex flex-col items-center justify-center leading-none"
              title="Net Score = Upvotes - Downvotes"
            >
              <span className={`text-[11px] ${netScore > 0 ? 'text-primary-700' : netScore < 0 ? 'text-error' : 'text-secondary-600'}`}>
                {netScore > 0 ? `+${netScore}` : netScore}
              </span>
              <span className="text-[8px] text-secondary-400 font-normal uppercase tracking-tighter">Score</span>
            </div>

            {/* Downvote Button */}
            <button
              onClick={(e) => handleVote(e, 'downvote')}
              disabled={!isEligible || isVoting}
              aria-label="Downvote issue"
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-bold transition-all min-h-[34px] ${
                !isEligible
                  ? 'opacity-40 cursor-not-allowed text-secondary-400'
                  : downvoted
                  ? 'bg-error text-white shadow-sm scale-95'
                  : 'text-secondary-500 hover:text-error hover:bg-white'
              }`}
              title={isEligible ? (downvoted ? 'Click to remove downvote' : 'Downvote this issue') : `Only residents of ${complaint.pincode} can vote`}
            >
              <ThumbsDown size={13} fill={downvoted ? 'currentColor' : 'none'} />
              <span>{downvotes}</span>
            </button>
          </div>

          {/* Comment count link */}
          <Link
            to={`/complaint/${complaintId}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-secondary-600 hover:bg-secondary-100 hover:text-primary-600 transition-colors no-underline min-h-[36px]"
          >
            <MessageCircle size={15} className="text-secondary-400" />
            <span>{commentCount} Comments</span>
          </Link>

          {/* Save bookmark */}
          <button
            onClick={handleSave}
            aria-label="Save issue"
            className={`p-2 rounded-lg text-xs transition-colors min-h-[36px] flex items-center ${
              saved ? 'text-primary-600 bg-primary-50' : 'text-secondary-400 hover:text-secondary-700 hover:bg-secondary-100'
            }`}
          >
            <Bookmark size={15} fill={saved ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Locked Voting Banner if user pincode does NOT match complaint pincode */}
        {!isEligible && (
          <div className="mt-2.5 flex items-center gap-1.5 text-[11px] font-medium text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
            <Lock size={12} className="text-amber-600 flex-shrink-0" />
            <span>Only residents of this pincode ({complaint.pincode}) can vote on this issue. (Your pincode: {registeredPincode})</span>
          </div>
        )}
      </div>
    </article>
  );
}

// ── Main Feed Screen ─────────────────────────────────────────────────────────
export default function Feed() {
  const { registeredPincode, selectedBrowsingPincode, setSelectedBrowsingPincode } = usePincode();

  const [activeSort, setActiveSort] = useState('top');
  const [activeFilter, setActiveFilter] = useState('all');

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Distinct browsing pincode options
  const defaultPincodes = ['400064', '400076', '400067', '400054', '110001', '560001'];
  const feedPincodes = complaints.map((c) => c.pincode).filter(Boolean);
  const availablePincodes = Array.from(new Set([...defaultPincodes, ...feedPincodes]));

  const fetchComplaints = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit: 10,
        sort: activeSort,
      };

      if (selectedBrowsingPincode && selectedBrowsingPincode !== 'all') {
        params.pincode = selectedBrowsingPincode;
      }

      if (activeFilter && activeFilter !== 'all') {
        params.category = activeFilter;
      }

      const res = await ApiClient.getComplaints(params);
      const items = Array.isArray(res) ? res : (res.complaints || []);
      setComplaints(items);
      if (res.pagination) {
        setPagination(res.pagination);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch civic issues from database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints(1);
  }, [selectedBrowsingPincode, activeFilter, activeSort]);

  const handleVoteUpdated = (complaintId, voteResult) => {
    setComplaints((prev) =>
      prev.map((c) => {
        if ((c.id || c._id) === complaintId) {
          return {
            ...c,
            upvotes: voteResult.upvotes,
            upvotes_count: voteResult.upvotes,
            downvotes: voteResult.downvotes,
            downvotes_count: voteResult.downvotes,
            net_score: voteResult.net_score,
            current_user_vote: voteResult.current_user_vote,
            currentUserVote: voteResult.current_user_vote,
          };
        }
        return c;
      })
    );
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchComplaints(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto pb-12 animate-fade-in">
      {/* Feed Title & Subheader */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-secondary-900 tracking-tight">Local Civic Feed</h1>
          <p className="text-xs text-secondary-500 mt-0.5">
            Registered Pincode: <strong className="text-primary-700 font-bold">{registeredPincode}</strong>
          </p>
        </div>
        <Link
          to="/report"
          className="bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold px-3.5 py-2 rounded-lg shadow-sm transition-colors no-underline flex items-center gap-1.5"
        >
          + Report Issue
        </Link>
      </div>

      {/* Pincode Browsing Filter Strip */}
      <div className="bg-surface border border-secondary-200 rounded-xl p-3 mb-4 shadow-card">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-secondary-800 flex items-center gap-1.5">
            <Filter size={13} className="text-primary-600" />
            Browse by Pincode Zone
          </span>
          {selectedBrowsingPincode !== 'all' && (
            <button
              onClick={() => setSelectedBrowsingPincode('all')}
              className="text-[11px] text-primary-600 hover:underline font-bold"
            >
              Show All Pincodes
            </button>
          )}
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedBrowsingPincode('all')}
            className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-colors border ${
              selectedBrowsingPincode === 'all'
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-secondary-50 text-secondary-600 border-secondary-200 hover:bg-white'
            }`}
          >
            All Pincodes
          </button>
          <button
            onClick={() => setSelectedBrowsingPincode(registeredPincode)}
            className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-colors border flex items-center gap-1 ${
              selectedBrowsingPincode === registeredPincode
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-primary-50 text-primary-700 border-primary-200 hover:bg-primary-100'
            }`}
          >
            📍 My Area ({registeredPincode})
          </button>

          {availablePincodes
            .filter((p) => p !== registeredPincode)
            .map((pin) => (
              <button
                key={pin}
                onClick={() => setSelectedBrowsingPincode(pin)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors border ${
                  selectedBrowsingPincode === pin
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-secondary-600 border-secondary-200 hover:border-primary-300'
                }`}
              >
                PIN: {pin}
              </button>
            ))}
        </div>
      </div>

      {/* Sorting Tabs */}
      <div className="flex items-center gap-1 bg-secondary-100 p-1.5 rounded-xl mb-3 border border-secondary-200/80">
        {SORT_TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveSort(id)}
            id={`sort-tab-${id}`}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all duration-fast ${
              activeSort === id
                ? 'bg-white text-primary-700 shadow-card border border-secondary-200/60'
                : 'text-secondary-500 hover:text-secondary-800'
            }`}
          >
            <Icon size={13} className={activeSort === id ? 'text-primary-600' : 'text-secondary-400'} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Category Filters (Horizontal Scrollbar) */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none">
        {FILTER_CATEGORIES.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setActiveFilter(id)}
            id={`filter-chip-${id}`}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-fast border ${
              activeFilter === id
                ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                : 'bg-white text-secondary-600 border-secondary-200 hover:border-primary-300 hover:text-primary-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Feed Content Area */}
      <div className="space-y-4">
        {/* Loading State */}
        {loading && (
          <div className="space-y-4">
            <FeedCardSkeleton />
            <FeedCardSkeleton />
            <FeedCardSkeleton />
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center my-6 shadow-sm">
            <AlertTriangle size={32} className="text-red-500 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-red-900 mb-1">Failed to load civic feed</h3>
            <p className="text-xs text-red-600 mb-4 max-w-md mx-auto">{error}</p>
            <button
              onClick={() => fetchComplaints(pagination.page || 1)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm inline-flex items-center gap-1.5"
            >
              <RefreshCw size={13} />
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && complaints.length === 0 && (
          <div className="bg-surface border border-secondary-200 rounded-xl p-8 text-center my-6 shadow-card">
            <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-3 border border-primary-200">
              <MapPin size={22} />
            </div>
            <h3 className="text-sm font-bold text-secondary-900 mb-1">No civic issues found</h3>
            <p className="text-secondary-500 text-xs font-medium max-w-sm mx-auto mb-4 leading-relaxed">
              No registered complaints match your active filters {selectedBrowsingPincode !== 'all' ? `for PIN ${selectedBrowsingPincode}` : ''}.
            </p>
            <button
              onClick={() => { setActiveFilter('all'); setSelectedBrowsingPincode('all'); }}
              className="px-4 py-2 bg-primary-50 text-primary-700 border border-primary-200 rounded-lg text-xs font-bold hover:bg-primary-100 transition-colors"
            >
              Reset all filters
            </button>
          </div>
        )}

        {/* Feed Posts */}
        {!loading && !error && complaints.length > 0 && (
          <>
            {complaints.map((complaint) => (
              <VisualPostCard
                key={complaint.id || complaint._id}
                complaint={complaint}
                onVoteUpdated={handleVoteUpdated}
              />
            ))}

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-surface border border-secondary-200 rounded-xl shadow-card">
                <div className="text-xs text-secondary-500 font-medium">
                  Page <strong className="text-secondary-900 font-bold">{pagination.page}</strong> of{' '}
                  <strong className="text-secondary-900 font-bold">{pagination.totalPages}</strong>{' '}
                  ({pagination.total} total complaints)
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={!pagination.hasPrevPage && pagination.page <= 1}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold border border-secondary-200 text-secondary-700 bg-white hover:bg-secondary-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>

                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === pagination.totalPages || Math.abs(p - pagination.page) <= 1)
                    .map((p, idx, arr) => {
                      const showEllipsis = idx > 0 && p - arr[idx - 1] > 1;
                      return (
                        <React.Fragment key={p}>
                          {showEllipsis && <span className="px-1 text-xs text-secondary-400">…</span>}
                          <button
                            onClick={() => handlePageChange(p)}
                            className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${
                              pagination.page === p
                                ? 'bg-primary-600 text-white shadow-sm'
                                : 'bg-white border border-secondary-200 text-secondary-700 hover:bg-secondary-50'
                            }`}
                          >
                            {p}
                          </button>
                        </React.Fragment>
                      );
                    })}

                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={!pagination.hasNextPage && pagination.page >= pagination.totalPages}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold border border-secondary-200 text-secondary-700 bg-white hover:bg-secondary-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
