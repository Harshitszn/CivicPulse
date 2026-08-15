import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ThumbsUp, ThumbsDown, MessageCircle, MapPin, Clock, Flame,
  Clock3, TrendingUp, AlertTriangle, Building2, Share2, Bookmark, CheckCircle2,
  Lock, Filter, Eye, Sparkles,
} from 'lucide-react';
import { StatusBadge, CategoryBadge, PriorityBadge } from '../../components/ui/Badge';
import StatusTimeline from '../../components/ui/StatusTimeline';
import { usePincode } from '../../context/PincodeContext';

// ── Mock Complaint Data (Visual Social Feed) ─────────────────────────────────
const MOCK_FEED = [
  {
    _id: '1',
    title: 'Hazardous deep pothole on MG Road near Bus Stop 12',
    description: 'A massive 3-foot deep pothole has formed right in front of the main bus shelter. Two two-wheelers skidded last night. Needs immediate asphalt resurfacing.',
    imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    category: 'Roads',
    categorySlug: 'roads',
    pincode: '560001',
    ward: 'Ward 47',
    priority: 'urgent',
    department: 'Public Works Department',
    status: 'in_progress',
    upvotes: 142,
    downvotes: 3,
    commentCount: 28,
    reportedBy: { name: 'Priya Sharma', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80', isAnonymous: false },
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    _id: '2',
    title: 'Severe waterlogging & blocked storm drain in Sector 14 Market',
    description: 'Following yesterday\'s rain, the storm drain clogged completely. Water is knee-deep outside the grocery stores, creating health hazards for shoppers.',
    imageUrl: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=800&q=80',
    category: 'Drainage',
    categorySlug: 'drainage',
    pincode: '110014',
    ward: 'Ward 12',
    priority: 'high',
    department: 'Stormwater Drainage Department',
    status: 'open',
    upvotes: 98,
    downvotes: 1,
    commentCount: 42,
    reportedBy: { name: 'Anonymous Resident', avatar: null, isAnonymous: true },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
  {
    _id: '3',
    title: 'Garbage dump accumulating near Children\'s Primary School',
    description: 'Sanitation trucks haven\'t picked up waste for 4 consecutive days. Odor is unbearable for schoolchildren and stray dogs are scattering litter everywhere.',
    imageUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80',
    category: 'Garbage',
    categorySlug: 'garbage',
    pincode: '560004',
    ward: 'Ward 31',
    priority: 'high',
    department: 'Sanitation & Solid Waste Management',
    status: 'acknowledged',
    upvotes: 86,
    downvotes: 4,
    commentCount: 19,
    reportedBy: { name: 'Rajesh Kumar', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80', isAnonymous: false },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
  },
  {
    _id: '4',
    title: 'Complete blackout — 8 streetlights unfunctional on Highway corridor',
    description: 'The entire 500-meter dark stretch near the flyover pedestrian crossing has broken street lamps. It poses a major safety risk for commuters after 7 PM.',
    imageUrl: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=800&q=80',
    category: 'Street Lighting',
    categorySlug: 'streetlights',
    pincode: '560002',
    ward: 'Ward 8',
    priority: 'medium',
    department: 'Electricity & Public Lighting Department',
    status: 'open',
    upvotes: 64,
    downvotes: 2,
    commentCount: 14,
    reportedBy: { name: 'Meena R.', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80', isAnonymous: false },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
  },
  {
    _id: '5',
    title: 'Main pipeline burst wasting gallons of clean drinking water',
    description: 'A major underground drinking water pipe ruptured near the community hall. High pressure stream spilling onto the road for over 12 hours.',
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=800&q=80',
    category: 'Water',
    categorySlug: 'water',
    pincode: '560003',
    ward: 'Ward 23',
    priority: 'urgent',
    department: 'City Water Supply Board',
    status: 'resolved',
    upvotes: 215,
    downvotes: 5,
    commentCount: 56,
    reportedBy: { name: 'Arun V.', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80', isAnonymous: false },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    _id: '6',
    title: 'Damaged perimeter fence & broken benches at Central Public Park',
    description: 'Boundary chain-link fence collapsed during high winds and multiple concrete benches are cracked, making the play area unsafe for kids.',
    imageUrl: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&w=800&q=80',
    category: 'Public Infrastructure',
    categorySlug: 'infra',
    pincode: '560018',
    ward: 'Ward 18',
    priority: 'low',
    department: 'Pedestrian Infrastructure Dept',
    status: 'open',
    upvotes: 31,
    downvotes: 1,
    commentCount: 7,
    reportedBy: { name: 'Sunitha M.', avatar: null, isAnonymous: false },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
  },
];

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
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

// ── Single Visual Post Component ─────────────────────────────────────────────
function VisualPostCard({ complaint }) {
  const { registeredPincode, isEligibleToVote, castVote, getComplaintVotes, getComplaintComments } = usePincode();
  const [saved, setSaved] = useState(false);

  const isEligible = isEligibleToVote(complaint.pincode);
  const { upvotes, downvotes, netScore, userVote } = getComplaintVotes(
    complaint._id,
    complaint.upvotes,
    complaint.downvotes
  );

  const { count: commentCount } = getComplaintComments(complaint._id, complaint.commentCount || 0);

  const upvoted = userVote === 'upvote';
  const downvoted = userVote === 'downvote';

  const handleUpvoteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    castVote(complaint._id, complaint.pincode, 'upvote');
  };

  const handleDownvoteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    castVote(complaint._id, complaint.pincode, 'downvote');
  };

  const handleSave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setSaved((s) => !s);
  };

  return (
    <article className="bg-surface border border-secondary-200 rounded-xl shadow-card hover:shadow-raised transition-all duration-normal overflow-hidden mb-5">
      {/* Post Header: User info + Status badge */}
      <div className="p-4 flex items-center justify-between border-b border-secondary-100/80 bg-white">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-primary-100 border border-primary-200 flex items-center justify-center overflow-hidden flex-shrink-0">
            {complaint.reportedBy.avatar ? (
              <img src={complaint.reportedBy.avatar} alt={complaint.reportedBy.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-primary-700 font-bold text-sm">
                {complaint.reportedBy.isAnonymous ? 'A' : complaint.reportedBy.name.charAt(0)}
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-secondary-900 leading-tight">
                {complaint.reportedBy.isAnonymous ? 'Anonymous Resident' : complaint.reportedBy.name}
              </span>
              <span className="text-xs text-secondary-400">• {timeAgo(complaint.createdAt)}</span>
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
        <Link to={`/complaint/${complaint._id}`} className="no-underline group">
          <h2 className="text-base font-bold text-secondary-900 group-hover:text-primary-600 transition-colors leading-snug mb-1.5">
            {complaint.title}
          </h2>
        </Link>
        <p className="text-xs text-secondary-600 leading-relaxed line-clamp-2">
          {complaint.description}
        </p>
      </div>

      {/* Large Issue Image */}
      {complaint.imageUrl && (
        <Link to={`/complaint/${complaint._id}`} className="block relative bg-secondary-100 aspect-video overflow-hidden">
          <img
            src={complaint.imageUrl}
            alt={complaint.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-slow"
            loading="lazy"
          />
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <CategoryBadge category={complaint.categorySlug || complaint.category} />
            <PriorityBadge priority={complaint.priority} />
          </div>
        </Link>
      )}

      {/* Metadata Strip: Department & Pincode */}
      <div className="px-4 py-2.5 bg-secondary-50/80 border-t border-b border-secondary-100 flex items-center justify-between text-xs text-secondary-500">
        <span className="flex items-center gap-1.5 font-medium truncate">
          <Building2 size={13} className="text-primary-600 flex-shrink-0" />
          Assigned: <strong className="text-secondary-800 font-semibold">{complaint.department}</strong>
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
              onClick={handleUpvoteClick}
              disabled={!isEligible}
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
              onClick={handleDownvoteClick}
              disabled={!isEligible}
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
            to={`/complaint/${complaint._id}`}
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
  const { registeredPincode, selectedBrowsingPincode, setSelectedBrowsingPincode, allComplaints } = usePincode();

  const [activeSort, setActiveSort] = useState('top');
  const [activeFilter, setActiveFilter] = useState('all');

  // Unique list of pincodes in feed
  const availablePincodes = Array.from(new Set(allComplaints.map((c) => c.pincode))).filter(Boolean);

  // Filter complaints by category and pincode
  const filtered = allComplaints.filter((c) => {
    const matchCategory =
      activeFilter === 'all' ||
      c.categorySlug === activeFilter ||
      (activeFilter === 'infra' && c.categorySlug === 'infrastructure') ||
      (activeFilter === 'infrastructure' && c.categorySlug === 'infra');
    const matchPincode = selectedBrowsingPincode === 'all' || c.pincode === selectedBrowsingPincode;
    return matchCategory && matchPincode;
  });

  // Sort complaints
  const sorted = [...filtered].sort((a, b) => {
    if (activeSort === 'top') return (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes);
    if (activeSort === 'new') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (activeSort === 'urgent') {
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
    }
    if (activeSort === 'discussed') return b.commentCount - a.commentCount;
    return 0;
  });

  return (
    <div className="max-w-xl mx-auto pb-12 animate-fade-in">
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
            All Pincodes ({allComplaints.length})
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

      {/* Feed Posts */}
      <div className="space-y-4">
        {sorted.map((complaint) => (
          <VisualPostCard key={complaint._id} complaint={complaint} />
        ))}

        {sorted.length === 0 && (
          <div className="bg-surface border border-secondary-200 rounded-xl p-8 text-center my-6">
            <p className="text-secondary-500 text-sm font-medium">No complaints found matching your active filters.</p>
            <button
              onClick={() => { setActiveFilter('all'); setSelectedBrowsingPincode('all'); }}
              className="mt-3 text-xs text-primary-600 font-bold hover:underline"
            >
              Reset all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
