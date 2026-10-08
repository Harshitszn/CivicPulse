import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusCircle, Clock, Building2, Calendar, MapPin, ThumbsUp,
  MessageCircle, RefreshCw, AlertCircle, Inbox,
} from 'lucide-react';
import { StatusBadge, CategoryBadge, PriorityBadge } from '../../components/ui/Badge';
import StatusTimeline from '../../components/ui/StatusTimeline';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import ApiClient from '../../services/api';

const FILTERS = [
  { id: 'all', label: 'All Issues' },
  { id: 'REPORTED', label: 'Reported' },
  { id: 'IN_PROGRESS', label: 'In Progress' },
  { id: 'RESOLVED', label: 'Resolved' },
];

function timeAgo(d) {
  if (!d) return 'recently';
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function matchesFilter(complaint, filter) {
  if (filter === 'all') return true;
  const s = (complaint.status || '').toUpperCase();
  if (filter === 'REPORTED') return ['REPORTED', 'OPEN', 'VERIFIED', 'ACKNOWLEDGED'].includes(s);
  if (filter === 'IN_PROGRESS') return ['IN_PROGRESS', 'ASSIGNED'].includes(s);
  if (filter === 'RESOLVED') return ['RESOLVED', 'CLOSED', 'REOPENED'].includes(s);
  return s === filter.toUpperCase();
}

export default function MyComplaints() {
  const { currentUser } = useAuth();
  const [filter, setFilter] = useState('all');
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMyComplaints = useCallback(async () => {
    if (!ApiClient.getToken()) {
      setLoading(false);
      setError('Please log in to see your complaints.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await ApiClient.getMyComplaints({ limit: 100, sort: 'new' });
      setComplaints(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load your complaints');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyComplaints();
  }, [fetchMyComplaints]);

  const filtered = complaints.filter((c) => matchesFilter(c, filter));

  // Summary stats
  const stats = {
    total: complaints.length,
    reported: complaints.filter((c) => matchesFilter(c, 'REPORTED')).length,
    inProgress: complaints.filter((c) => matchesFilter(c, 'IN_PROGRESS')).length,
    resolved: complaints.filter((c) => matchesFilter(c, 'RESOLVED')).length,
  };

  return (
    <div className="animate-fade-in w-full max-w-4xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-lg sm:text-xl font-extrabold text-secondary-900 tracking-tight">My Reported Issues</h1>
          <p className="text-xs text-secondary-500 mt-0.5">
            {currentUser ? `Issues filed by ${currentUser.name || currentUser.full_name || currentUser.email}` : 'Track live progress of grievances filed by you'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchMyComplaints}
            disabled={loading}
            className="p-2 rounded-lg border border-secondary-200 text-secondary-500 hover:bg-secondary-50 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          <Link to="/report">
            <Button variant="primary" icon={PlusCircle} size="sm" className="font-bold text-xs">
              Report Issue
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Overview Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
        <button onClick={() => setFilter('all')} className="bg-secondary-50 border border-secondary-200 rounded-xl p-3 text-center hover:border-secondary-300 transition-colors">
          <p className="text-lg font-extrabold text-secondary-900">{stats.total}</p>
          <p className="text-[10px] font-semibold text-secondary-500 mt-0.5">Total Filed</p>
        </button>
        <button onClick={() => setFilter('REPORTED')} className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center hover:border-blue-300 transition-colors">
          <p className="text-lg font-extrabold text-blue-800">{stats.reported}</p>
          <p className="text-[10px] font-semibold text-blue-600 mt-0.5">Reported</p>
        </button>
        <button onClick={() => setFilter('IN_PROGRESS')} className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center hover:border-amber-300 transition-colors">
          <p className="text-lg font-extrabold text-amber-800">{stats.inProgress}</p>
          <p className="text-[10px] font-semibold text-amber-600 mt-0.5">In Progress</p>
        </button>
        <button onClick={() => setFilter('RESOLVED')} className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center hover:border-emerald-300 transition-colors">
          <p className="text-lg font-extrabold text-emerald-800">{stats.resolved}</p>
          <p className="text-[10px] font-semibold text-emerald-600 mt-0.5">Resolved</p>
        </button>
      </div>

      {/* Filter Tabs */}
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

      {/* Loading State */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-secondary-200 rounded-xl h-32 animate-pulse" />
          ))}
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <AlertCircle size={28} className="text-red-400 mx-auto mb-2" />
          <p className="text-sm font-bold text-red-700">{error}</p>
          {ApiClient.getToken() && (
            <button onClick={fetchMyComplaints} className="mt-3 text-xs font-semibold text-primary-600 hover:underline flex items-center gap-1 mx-auto">
              <RefreshCw size={12} /> Retry
            </button>
          )}
          {!ApiClient.getToken() && (
            <Link to="/login" className="mt-3 inline-block text-xs font-bold text-primary-600 hover:underline">
              Log in →
            </Link>
          )}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filtered.length === 0 && (
        <div className="text-center py-12 bg-white border border-secondary-200 rounded-xl space-y-2">
          <Inbox size={32} className="text-secondary-300 mx-auto mb-1" />
          <p className="text-sm font-bold text-secondary-700">
            {complaints.length === 0 ? 'No issues filed yet' : `No issues under "${FILTERS.find(f => f.id === filter)?.label || filter}"`}
          </p>
          <p className="text-xs text-secondary-400">File a new issue to track its resolution timeline.</p>
          <Link to="/report" className="inline-block mt-2">
            <Button variant="primary" size="sm">Report an Issue</Button>
          </Link>
        </div>
      )}

      {/* Complaint Cards */}
      {!loading && !error && filtered.length > 0 && (
        <div className="space-y-4">
          {filtered.map((complaint) => {
            const compId = complaint.id || complaint._id;
            const upvotes = complaint.upvotes_count ?? complaint.upvotes ?? 0;
            const downvotes = complaint.downvotes_count ?? complaint.downvotes ?? 0;
            const netScore = complaint.net_score ?? (upvotes - downvotes);
            const imageUrl = complaint.imageUrl || (complaint.image_urls && complaint.image_urls[0]) || null;
            const dept = complaint.department || complaint.assigned_department || 'Municipal Works';
            const eta = complaint.estimatedResolution || complaint.estimated_resolution_time || '3–5 Days';

            return (
              <article key={compId} className="bg-white border border-secondary-200 rounded-xl shadow-card hover:shadow-raised transition-all duration-normal overflow-hidden">
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

                {/* Body */}
                <div className="p-4 flex gap-4 items-start">
                  {/* Thumbnail */}
                  {imageUrl ? (
                    <div className="w-24 h-24 rounded-lg overflow-hidden bg-secondary-100 flex-shrink-0 border border-secondary-200">
                      <img src={imageUrl} alt={complaint.title} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-lg bg-secondary-100 border border-secondary-200 flex flex-col items-center justify-center text-secondary-400 text-xs flex-shrink-0">
                      <Building2 size={20} />
                      <span className="text-[10px] mt-1 font-medium">No Image</span>
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <Link to={`/complaint/${compId}`} className="no-underline group block">
                      <h2 className="text-sm font-bold text-secondary-900 group-hover:text-primary-600 transition-colors leading-snug line-clamp-2">
                        {complaint.title}
                      </h2>
                    </Link>
                    <p className="text-xs text-secondary-600 flex items-center gap-1.5 font-medium truncate">
                      <Building2 size={13} className="text-primary-600 flex-shrink-0" />
                      <span>Dept: <strong className="text-secondary-800 font-semibold">{dept}</strong></span>
                    </p>
                    <p className="text-xs text-amber-800 bg-amber-50 px-2 py-1 rounded border border-amber-200 inline-flex items-center gap-1.5 font-medium">
                      <Calendar size={12} className="text-amber-600 flex-shrink-0" />
                      <span>Target ETA: <strong>{eta}</strong></span>
                    </p>
                  </div>
                </div>

                {/* Status Timeline */}
                <div className="px-4 py-2.5 bg-secondary-50/70 border-t border-b border-secondary-100">
                  <StatusTimeline currentStatus={complaint.status} compact />
                </div>

                {/* Footer */}
                <div className="px-4 py-3 bg-white flex items-center justify-between text-xs text-secondary-500">
                  <span className="flex items-center gap-1 font-medium">
                    <Clock size={12} className="text-secondary-400" />
                    Reported {timeAgo(complaint.created_at || complaint.createdAt)}
                  </span>
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1 font-bold text-secondary-700 bg-secondary-100 px-2.5 py-1 rounded-md">
                      <ThumbsUp size={13} className="text-primary-600" />
                      Score: {netScore > 0 ? `+${netScore}` : netScore}
                    </span>
                    <Link to={`/complaint/${compId}`} className="flex items-center gap-1 font-semibold text-secondary-600 hover:text-primary-600 no-underline">
                      <MessageCircle size={13} className="text-secondary-400" />
                      <span>View Details</span>
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
