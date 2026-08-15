import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, ArrowRight } from 'lucide-react';
import { StatusBadge, CategoryBadge, PriorityBadge } from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const ALL_COMPLAINTS = [
  { _id: '1', title: 'Giant pothole on MG Road near bus stop',       category: 'roads',        status: 'in_progress',  priority: 'high',   ward: 'Ward 47', reportedAt: '30m ago',  upvotes: 128 },
  { _id: '2', title: 'No water supply for 3 days in Sector 14',     category: 'water',        status: 'acknowledged', priority: 'urgent', ward: 'Ward 12', reportedAt: '2h ago',   upvotes: 94  },
  { _id: '3', title: 'Broken street lights on NH corridor',          category: 'streetlights', status: 'open',         priority: 'medium', ward: 'Ward 8',  reportedAt: '5h ago',   upvotes: 67  },
  { _id: '4', title: 'Overflowing drainage at main market',         category: 'drainage',     status: 'open',         priority: 'high',   ward: 'Ward 23', reportedAt: '6h ago',   upvotes: 54  },
  { _id: '5', title: 'Garbage not collected for 5 days',            category: 'sanitation',   status: 'resolved',     priority: 'medium', ward: 'Ward 31', reportedAt: '1d ago',   upvotes: 43  },
  { _id: '6', title: 'Park bench damaged in Childrens Park Sector 5',category: 'parks',       status: 'open',         priority: 'low',    ward: 'Ward 18', reportedAt: '2d ago',   upvotes: 12  },
  { _id: '7', title: 'Power outage in residential block B4',         category: 'electricity',  status: 'resolved',     priority: 'high',   ward: 'Ward 9',  reportedAt: '3d ago',   upvotes: 78  },
  { _id: '8', title: 'Noise from construction at night',             category: 'noise',        status: 'acknowledged', priority: 'medium', ward: 'Ward 14', reportedAt: '3d ago',   upvotes: 31  },
];

const STATUS_FILTERS  = ['all', 'open', 'acknowledged', 'in_progress', 'resolved', 'rejected'];
const CATEGORY_FILTERS = ['all', 'roads', 'water', 'electricity', 'sanitation', 'parks', 'streetlights', 'drainage', 'noise', 'other'];

export default function MunicipalComplaints() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filtered = ALL_COMPLAINTS.filter((c) => {
    const matchSearch   = !search || c.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus   = statusFilter === 'all' || c.status === statusFilter;
    const matchCategory = categoryFilter === 'all' || c.category === categoryFilter;
    return matchSearch && matchStatus && matchCategory;
  });

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-secondary-900">Complaints</h2>
          <p className="text-sm text-secondary-400">{filtered.length} of {ALL_COMPLAINTS.length} shown</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-surface border border-secondary-200 rounded-lg p-4 space-y-3">
        <Input
          placeholder="Search complaints..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={Search}
          id="complaints-search"
        />
        <div className="flex gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-medium text-secondary-400 whitespace-nowrap self-center">Status:</span>
          {STATUS_FILTERS.map((f) => (
            <button key={f} onClick={() => setStatusFilter(f)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap border transition-all ${statusFilter === f ? 'bg-primary-600 text-white border-primary-600' : 'bg-surface text-secondary-500 border-secondary-200 hover:border-primary-300'}`}>
              {f.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </button>
          ))}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-medium text-secondary-400 whitespace-nowrap self-center">Category:</span>
          {CATEGORY_FILTERS.map((f) => (
            <button key={f} onClick={() => setCategoryFilter(f)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap border transition-all ${categoryFilter === f ? 'bg-primary-600 text-white border-primary-600' : 'bg-surface text-secondary-500 border-secondary-200 hover:border-primary-300'}`}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface rounded-lg border border-secondary-200 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-secondary-50 border-b border-secondary-200">
                {['Title', 'Category', 'Status', 'Priority', 'Ward', 'Votes', 'Reported'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-10 text-secondary-400 text-sm">No complaints match your filters.</td></tr>
              ) : filtered.map((c) => (
                <tr key={c._id} className="border-b border-secondary-100 last:border-0 hover:bg-secondary-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link to={`/municipal/complaints/${c._id}`} className="text-secondary-800 hover:text-primary-700 font-medium no-underline line-clamp-1 max-w-xs block">{c.title}</Link>
                  </td>
                  <td className="px-4 py-3"><CategoryBadge category={c.category} /></td>
                  <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                  <td className="px-4 py-3"><PriorityBadge priority={c.priority} /></td>
                  <td className="px-4 py-3 text-xs text-secondary-500">{c.ward}</td>
                  <td className="px-4 py-3 text-xs font-medium text-secondary-600">👍 {c.upvotes}</td>
                  <td className="px-4 py-3 text-xs text-secondary-400 whitespace-nowrap">{c.reportedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
