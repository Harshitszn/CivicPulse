import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, FileText, Clock, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import Card from '../../components/ui/Card';
import { StatusBadge, CategoryBadge } from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

const MY_COMPLAINTS = [
  {
    _id: '1', title: 'Giant pothole on MG Road near bus stop',
    category: 'roads', status: 'in_progress', createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    upvotes: 128, commentCount: 23,
  },
  {
    _id: '3', title: 'Broken street lights on NH corridor',
    category: 'streetlights', status: 'resolved', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    upvotes: 67, commentCount: 12,
  },
  {
    _id: '6', title: 'Park bench damaged in Children\'s Park, Sector 5',
    category: 'parks', status: 'open', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    upvotes: 12, commentCount: 3,
  },
  {
    _id: '7', title: 'Electricity outage in our building block',
    category: 'electricity', status: 'acknowledged', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    upvotes: 34, commentCount: 7,
  },
];

const STATUS_SUMMARY = [
  { label: 'Total',       value: 4,  icon: FileText,    color: 'text-secondary-600', bg: 'bg-secondary-50'  },
  { label: 'In Progress', value: 1,  icon: Loader2,     color: 'text-warning',       bg: 'bg-yellow-50'     },
  { label: 'Resolved',    value: 1,  icon: CheckCircle2,color: 'text-success',       bg: 'bg-green-50'      },
  { label: 'Open',        value: 2,  icon: Clock,       color: 'text-primary-600',   bg: 'bg-primary-50'    },
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
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all'
    ? MY_COMPLAINTS
    : MY_COMPLAINTS.filter((c) => c.status === filter);

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-lg font-bold text-secondary-900">My Complaints</h1>
          <p className="text-xs text-secondary-400 mt-0.5">Track your submitted issues</p>
        </div>
        <Link to="/report">
          <Button variant="primary" icon={PlusCircle} size="sm">New</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2 mb-5">
        {STATUS_SUMMARY.map((s) => (
          <div key={s.label} className={`${s.bg} rounded-lg p-3 text-center`}>
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-secondary-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-1.5 mb-4 flex-wrap">
        {['all', 'open', 'acknowledged', 'in_progress', 'resolved'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={[
              'px-3 py-1 rounded-full text-xs font-medium transition-all border',
              filter === f
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-surface text-secondary-500 border-secondary-200 hover:border-primary-300',
            ].join(' ')}
          >
            {f.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-10 text-secondary-400 text-sm">No complaints found.</div>
        ) : (
          filtered.map((complaint) => (
            <Link key={complaint._id} to={`/complaint/${complaint._id}`} className="no-underline block">
              <div className="bg-surface border border-secondary-200 rounded-lg p-4 hover:shadow-raised transition-shadow duration-normal">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="text-sm font-semibold text-secondary-800 line-clamp-2 flex-1">
                    {complaint.title}
                  </p>
                  <StatusBadge status={complaint.status} />
                </div>
                <div className="flex items-center gap-3 text-xs text-secondary-400">
                  <CategoryBadge category={complaint.category} />
                  <span className="flex items-center gap-0.5">
                    <Clock size={10} />{timeAgo(complaint.createdAt)}
                  </span>
                  <span>👍 {complaint.upvotes}</span>
                  <span>💬 {complaint.commentCount}</span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
