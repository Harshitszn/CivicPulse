import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ThumbsUp, ThumbsDown, MessageCircle, MapPin, Clock, Filter, ChevronDown,
  Flame, Clock3, TrendingUp,
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge, { StatusBadge, CategoryBadge } from '../../components/ui/Badge';
import { FeedCardSkeleton } from '../../components/ui/LoadingSpinner';

// ── Placeholder data ────────────────────────────────────────────────────────
const MOCK_COMPLAINTS = [
  {
    _id: '1', title: 'Giant pothole on MG Road near bus stop',
    description: 'There is a massive pothole near the City Bus Stop 12 that has caused two accidents this week. Urgent attention needed.',
    category: 'roads', status: 'open', priority: 'high',
    upvotes: 128, downvotes: 4, commentCount: 23,
    location: { address: 'MG Road, near Bus Stop 12', pincode: '560001' },
    reportedBy: { name: 'Priya Sharma', avatar: null },
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    images: [],
  },
  {
    _id: '2', title: 'No water supply for 3 days in Sector 14',
    description: 'Our entire block has had no running water for the past 3 days. Residents are struggling to manage daily activities.',
    category: 'water', status: 'acknowledged', priority: 'urgent',
    upvotes: 94, downvotes: 1, commentCount: 47,
    location: { address: 'Sector 14, Block C', pincode: '110014' },
    reportedBy: { name: 'Rajesh Kumar', avatar: null },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    images: [],
  },
  {
    _id: '3', title: 'Broken street lights on NH corridor',
    description: 'Street lights have been broken for over a week making it unsafe to walk at night especially for women.',
    category: 'streetlights', status: 'in_progress', priority: 'medium',
    upvotes: 67, downvotes: 2, commentCount: 12,
    location: { address: 'NH 48, Near Flyover', pincode: '560002' },
    reportedBy: { name: 'Meena R.', avatar: null },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    images: [],
  },
  {
    _id: '4', title: 'Overflowing drainage causing water logging',
    description: 'The drainage near the main market has been blocked and is overflowing onto the road causing severe water logging.',
    category: 'drainage', status: 'open', priority: 'high',
    upvotes: 54, downvotes: 0, commentCount: 8,
    location: { address: 'Main Market Road', pincode: '560003' },
    reportedBy: { name: 'Arun V.', avatar: null },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    images: [],
  },
  {
    _id: '5', title: 'Garbage not collected for 5 days in our area',
    description: 'The municipal garbage truck hasn\'t visited our locality for 5 consecutive days. Waste is piling up causing health hazards.',
    category: 'sanitation', status: 'resolved', priority: 'medium',
    upvotes: 43, downvotes: 3, commentCount: 19,
    location: { address: 'Green Valley Colony', pincode: '560004' },
    reportedBy: { name: 'Sunitha M.', avatar: null },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    images: [],
  },
];

const SORT_OPTIONS = [
  { value: 'hot',    label: 'Hot',     icon: Flame    },
  { value: 'new',    label: 'New',     icon: Clock3   },
  { value: 'top',    label: 'Top',     icon: TrendingUp },
];

const CATEGORIES = ['all', 'roads', 'water', 'electricity', 'sanitation', 'parks', 'streetlights', 'drainage', 'noise', 'other'];

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function FeedCard({ complaint }) {
  const [upvoted, setUpvoted] = useState(false);
  const [downvoted, setDownvoted] = useState(false);
  const [votes, setVotes] = useState(complaint.upvotes - complaint.downvotes);

  const handleUpvote = (e) => {
    e.preventDefault();
    if (upvoted) { setUpvoted(false); setVotes((v) => v - 1); }
    else { setUpvoted(true); setVotes((v) => v + (downvoted ? 2 : 1)); setDownvoted(false); }
  };
  const handleDownvote = (e) => {
    e.preventDefault();
    if (downvoted) { setDownvoted(false); setVotes((v) => v + 1); }
    else { setDownvoted(true); setVotes((v) => v - (upvoted ? 2 : 1)); setUpvoted(false); }
  };

  return (
    <Link to={`/complaint/${complaint._id}`} className="no-underline">
      <article className="bg-surface border border-secondary-200 rounded-lg hover:shadow-raised transition-shadow duration-normal mb-3">
        {/* Author row */}
        <div className="flex items-center gap-2.5 px-4 pt-4 pb-2">
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
            <span className="text-primary-700 text-xs font-bold">
              {complaint.reportedBy.name.charAt(0)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-semibold text-secondary-700">{complaint.reportedBy.name}</span>
            <span className="text-xs text-secondary-400 ml-2">
              <Clock size={10} className="inline mr-0.5" />
              {timeAgo(complaint.createdAt)}
            </span>
          </div>
          <StatusBadge status={complaint.status} />
        </div>

        {/* Title */}
        <div className="px-4 pb-2">
          <h2 className="text-sm font-semibold text-secondary-900 line-clamp-2 hover:text-primary-700 transition-colors">
            {complaint.title}
          </h2>
          <p className="text-xs text-secondary-400 mt-1 line-clamp-2">{complaint.description}</p>
        </div>

        {/* Location + Category */}
        <div className="px-4 pb-3 flex items-center gap-2 flex-wrap">
          <CategoryBadge category={complaint.category} />
          <span className="text-[10px] text-secondary-400 flex items-center gap-0.5">
            <MapPin size={10} />
            {complaint.location.address}
          </span>
        </div>

        {/* Actions row */}
        <div className="flex items-center gap-1 px-3 py-2.5 border-t border-secondary-100">
          <button
            onClick={handleUpvote}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors min-h-[36px]
              ${upvoted ? 'bg-primary-50 text-primary-700' : 'text-secondary-500 hover:bg-secondary-100 hover:text-secondary-700'}`}
          >
            <ThumbsUp size={13} fill={upvoted ? 'currentColor' : 'none'} />
            {votes}
          </button>
          <button
            onClick={handleDownvote}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors min-h-[36px]
              ${downvoted ? 'bg-red-50 text-red-600' : 'text-secondary-400 hover:bg-secondary-100'}`}
          >
            <ThumbsDown size={13} fill={downvoted ? 'currentColor' : 'none'} />
          </button>
          <button className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs text-secondary-400 hover:bg-secondary-100 hover:text-secondary-600 transition-colors min-h-[36px]">
            <MessageCircle size={13} />
            {complaint.commentCount}
          </button>
        </div>
      </article>
    </Link>
  );
}

export default function Feed() {
  const [sort, setSort] = useState('hot');
  const [category, setCategory] = useState('all');
  const [loading] = useState(false);

  const filtered = category === 'all'
    ? MOCK_COMPLAINTS
    : MOCK_COMPLAINTS.filter((c) => c.category === category);

  return (
    <div>
      {/* Feed header */}
      <div className="mb-4">
        <h1 className="text-lg font-bold text-secondary-900">Local Issues Feed</h1>
        <p className="text-xs text-secondary-400 mt-0.5">Issues reported in your area</p>
      </div>

      {/* Sort tabs */}
      <div className="flex items-center gap-1 mb-3 bg-secondary-100 rounded-lg p-1">
        {SORT_OPTIONS.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => setSort(value)}
            className={[
              'flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-semibold transition-all duration-fast',
              sort === value
                ? 'bg-surface text-secondary-800 shadow-subtle'
                : 'text-secondary-500 hover:text-secondary-700',
            ].join(' ')}
          >
            <Icon size={12} />
            {label}
          </button>
        ))}
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={[
              'px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-fast border',
              category === cat
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-surface text-secondary-500 border-secondary-200 hover:border-primary-300',
            ].join(' ')}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* Feed cards */}
      {loading ? (
        Array.from({ length: 3 }).map((_, i) => <FeedCardSkeleton key={i} />)
      ) : (
        <>
          {filtered.map((c) => <FeedCard key={c._id} complaint={c} />)}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-secondary-400">
              <p className="text-sm">No issues found in this category.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
