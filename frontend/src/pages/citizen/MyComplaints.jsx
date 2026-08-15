import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Clock, Building2, Calendar, MapPin, ThumbsUp, MessageCircle } from 'lucide-react';
import { StatusBadge, CategoryBadge, PriorityBadge } from '../../components/ui/Badge';
import StatusTimeline from '../../components/ui/StatusTimeline';
import Button from '../../components/ui/Button';
import { usePincode } from '../../context/PincodeContext';

const DEFAULT_MY_COMPLAINTS = [
  {
    _id: '1',
    title: 'Giant pothole on MG Road near bus stop 12',
    description: 'Deep 3-foot pothole causing major traffic slowdown and two-wheeler skids.',
    imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80',
    category: 'roads',
    status: 'in_progress',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    upvotes: 128,
    downvotes: 2,
    commentCount: 23,
    pincode: '560001',
    department: 'Public Works Department (PWD)',
    estimatedResolution: '3–5 Days',
    priority: 'high',
  },
  {
    _id: '3',
    title: 'Broken street lights on NH corridor stretch',
    description: 'Four consecutive streetlights out of service creating dark dangerous driving conditions.',
    imageUrl: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=600&q=80',
    category: 'streetlights',
    status: 'resolved',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    upvotes: 67,
    downvotes: 1,
    commentCount: 12,
    pincode: '560001',
    department: 'Electricity & Lighting Division',
    estimatedResolution: 'Resolved on Aug 14',
    priority: 'medium',
  },
  {
    _id: '6',
    title: 'Park bench damaged in Children\'s Park, Sector 5',
    description: 'Wooden slats broken on seating bench near play area.',
    imageUrl: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&w=600&q=80',
    category: 'parks',
    status: 'open',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    upvotes: 12,
    downvotes: 0,
    commentCount: 3,
    pincode: '560001',
    department: 'Horticulture & Parks Dept',
    estimatedResolution: '5–7 Days',
    priority: 'low',
  },
  {
    _id: '7',
    title: 'Electricity outage in residential block B4',
    description: 'Transformer trip causing blackout in 4 apartments.',
    imageUrl: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=600&q=80',
    category: 'electricity',
    status: 'assigned',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    upvotes: 34,
    downvotes: 0,
    commentCount: 7,
    pincode: '560001',
    department: 'BESCOM Power Utility',
    estimatedResolution: '24–48 Hours',
    priority: 'high',
  },
];

const FILTERS = [
  { id: 'all', label: 'All Issues' },
  { id: 'reported', label: 'Reported' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'resolved', label: 'Resolved' },
];

function timeAgo(d) {
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function MyComplaints() {
  const { getComplaintVotes, getComplaintComments, allComplaints } = usePincode();
  const [filter, setFilter] = useState('all');

  const allUserComplaints = useMemo(() => {
    return allComplaints || DEFAULT_MY_COMPLAINTS;
  }, [allComplaints]);

  const filtered = useMemo(() => {
    if (filter === 'all') return allUserComplaints;
    return allUserComplaints.filter((c) => {
      if (filter === 'reported') return c.status === 'open' || c.status === 'reported' || c.status === 'verified';
      if (filter === 'in_progress') return c.status === 'in_progress' || c.status === 'assigned' || c.status === 'acknowledged';
      if (filter === 'resolved') return c.status === 'resolved' || c.status === 'closed';
      return c.status === filter;
    });
  }, [allUserComplaints, filter]);

  // Compute status summary breakdown
  const stats = useMemo(() => {
    const total = allUserComplaints.length;
    const reported = allUserComplaints.filter((c) => c.status === 'open' || c.status === 'reported' || c.status === 'verified').length;
    const inProgress = allUserComplaints.filter((c) => c.status === 'in_progress' || c.status === 'assigned' || c.status === 'acknowledged').length;
    const resolved = allUserComplaints.filter((c) => c.status === 'resolved' || c.status === 'closed').length;
    return { total, reported, inProgress, resolved };
  }, [allUserComplaints]);

  return (
    <div className="animate-fade-in max-w-2xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-lg font-extrabold text-secondary-900">My Reported Issues</h1>
          <p className="text-xs text-secondary-500 mt-0.5">Track live progress of grievances filed by you</p>
        </div>
        <Link to="/report">
          <Button variant="primary" icon={PlusCircle} size="sm" className="font-bold text-xs">
            Report Issue
          </Button>
        </Link>
      </div>

      {/* Stats Overview Strip */}
      <div className="grid grid-cols-4 gap-2 mb-5">
        <button onClick={() => setFilter('all')} className="bg-secondary-50 border border-secondary-200 rounded-xl p-3 text-center hover:border-secondary-300 transition-colors">
          <p className="text-lg font-extrabold text-secondary-900">{stats.total}</p>
          <p className="text-[10px] font-semibold text-secondary-500 mt-0.5">Total Filed</p>
        </button>

        <button onClick={() => setFilter('reported')} className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center hover:border-blue-300 transition-colors">
          <p className="text-lg font-extrabold text-blue-800">{stats.reported}</p>
          <p className="text-[10px] font-semibold text-blue-600 mt-0.5">Reported</p>
        </button>

        <button onClick={() => setFilter('in_progress')} className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center hover:border-amber-300 transition-colors">
          <p className="text-lg font-extrabold text-amber-800">{stats.inProgress}</p>
          <p className="text-[10px] font-semibold text-amber-600 mt-0.5">In Progress</p>
        </button>

        <button onClick={() => setFilter('resolved')} className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center hover:border-emerald-300 transition-colors">
          <p className="text-lg font-extrabold text-emerald-800">{stats.resolved}</p>
          <p className="text-[10px] font-semibold text-emerald-600 mt-0.5">Resolved</p>
        </button>
      </div>

      {/* Exact 4 Required Filters: All, Reported, In Progress, Resolved */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1 border-b border-secondary-100">
        {FILTERS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all border ${
              filter === tab.id
                ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                : 'bg-white text-secondary-600 border-secondary-200 hover:border-primary-300 hover:bg-secondary-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Visual Content Feed of User Complaints */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="text-center py-12 bg-white border border-secondary-200 rounded-xl space-y-2">
            <p className="text-sm font-bold text-secondary-700">No issues found under "{filter.replace('_', ' ')}"</p>
            <p className="text-xs text-secondary-400">File a new issue to track its resolution timeline.</p>
            <Link to="/report" className="inline-block mt-2">
              <Button variant="primary" size="sm">Report an Issue</Button>
            </Link>
          </div>
        ) : (
          filtered.map((complaint) => {
            const { netScore } = getComplaintVotes(complaint._id, complaint.upvotes, complaint.downvotes);
            const { count: commentCount } = getComplaintComments(complaint._id, complaint.commentCount || 0);

            return (
              <article key={complaint._id} className="bg-white border border-secondary-200 rounded-xl shadow-card hover:shadow-raised transition-all duration-normal overflow-hidden">
                {/* Header: Category, Status & Priority */}
                <div className="p-4 pb-3 flex items-start justify-between gap-3 border-b border-secondary-100/80">
                  <div className="flex items-center gap-2 flex-wrap">
                    <CategoryBadge category={complaint.categorySlug || complaint.category} />
                    {complaint.priority && <PriorityBadge priority={complaint.priority} />}
                    <span className="text-xs font-semibold text-primary-700 bg-primary-50 px-2 py-0.5 rounded border border-primary-200 flex items-center gap-1">
                      <MapPin size={11} /> PIN: {complaint.pincode}
                    </span>
                  </div>

                  <StatusBadge status={complaint.status} />
                </div>

                {/* Body Content & Thumbnail Image */}
                <div className="p-4 flex gap-4 items-start">
                  {/* Thumbnail Image */}
                  {complaint.imageUrl ? (
                    <div className="w-24 h-24 rounded-lg overflow-hidden bg-secondary-100 flex-shrink-0 border border-secondary-200">
                      <img src={complaint.imageUrl} alt={complaint.title} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-lg bg-secondary-100 border border-secondary-200 flex flex-col items-center justify-center text-secondary-400 text-xs flex-shrink-0">
                      <Building2 size={20} />
                      <span className="text-[10px] mt-1 font-medium">No Image</span>
                    </div>
                  )}

                  {/* Title & Metadata */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <Link to={`/complaint/${complaint._id}`} className="no-underline group block">
                      <h2 className="text-sm font-bold text-secondary-900 group-hover:text-primary-600 transition-colors leading-snug line-clamp-2">
                        {complaint.title}
                      </h2>
                    </Link>

                    {/* Department */}
                    <p className="text-xs text-secondary-600 flex items-center gap-1.5 font-medium truncate">
                      <Building2 size={13} className="text-primary-600 flex-shrink-0" />
                      <span>Dept: <strong className="text-secondary-800 font-semibold">{complaint.department || 'Municipal Works'}</strong></span>
                    </p>

                    {/* Estimated Resolution Time */}
                    <p className="text-xs text-amber-800 bg-amber-50 px-2 py-1 rounded border border-amber-200 inline-flex items-center gap-1.5 font-medium">
                      <Calendar size={12} className="text-amber-600 flex-shrink-0" />
                      <span>Target ETA: <strong>{complaint.estimatedResolution || '3–5 Days'}</strong></span>
                    </p>
                  </div>
                </div>

                {/* Status Timeline Stepper */}
                <div className="px-4 py-2.5 bg-secondary-50/70 border-t border-b border-secondary-100">
                  <StatusTimeline currentStatus={complaint.status} compact />
                </div>

                {/* Footer Bar: Created time, Vote Score, Comments */}
                <div className="px-4 py-3 bg-white flex items-center justify-between text-xs text-secondary-500">
                  <span className="flex items-center gap-1 font-medium">
                    <Clock size={12} className="text-secondary-400" />
                    Reported {timeAgo(complaint.createdAt)}
                  </span>

                  <div className="flex items-center gap-4">
                    {/* Vote Score */}
                    <span className="flex items-center gap-1 font-bold text-secondary-700 bg-secondary-100 px-2.5 py-1 rounded-md">
                      <ThumbsUp size={13} className="text-primary-600" />
                      Score: {netScore > 0 ? `+${netScore}` : netScore}
                    </span>

                    {/* Comments */}
                    <Link to={`/complaint/${complaint._id}`} className="flex items-center gap-1 font-semibold text-secondary-600 hover:text-primary-600 no-underline">
                      <MessageCircle size={13} className="text-secondary-400" />
                      <span>{commentCount} Comments</span>
                    </Link>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
