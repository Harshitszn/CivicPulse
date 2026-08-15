import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, ArrowRight, MapPin, Building2, Layers } from 'lucide-react';
import { StatusBadge, CategoryBadge, PriorityBadge } from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { usePincode } from '../../context/PincodeContext';

function timeAgo(dateString) {
  if (!dateString) return 'Just now';
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
}

export default function MunicipalComplaints() {
  const { allComplaints, getComplaintVotes, getComplaintVerification } = usePincode();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [pincodeFilter, setPincodeFilter] = useState('all');

  const uniquePincodes = useMemo(() => {
    return Array.from(new Set(allComplaints.map((c) => c.pincode).filter(Boolean))).sort();
  }, [allComplaints]);

  const uniqueCategories = useMemo(() => {
    return Array.from(new Set(allComplaints.map((c) => c.category || c.categorySlug).filter(Boolean))).sort();
  }, [allComplaints]);

  const filtered = useMemo(() => {
    return allComplaints.filter((c) => {
      const matchSearch =
        !search ||
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c._id.toLowerCase().includes(search.toLowerCase()) ||
        (c.department && c.department.toLowerCase().includes(search.toLowerCase()));
      const matchStatus = statusFilter === 'all' || c.status === statusFilter;
      const matchCategory =
        categoryFilter === 'all' ||
        (c.category && c.category.toLowerCase() === categoryFilter.toLowerCase()) ||
        (c.categorySlug && c.categorySlug.toLowerCase() === categoryFilter.toLowerCase());
      const matchPin = pincodeFilter === 'all' || c.pincode === pincodeFilter;

      return matchSearch && matchStatus && matchCategory && matchPin;
    });
  }, [allComplaints, search, statusFilter, categoryFilter, pincodeFilter]);

  return (
    <div className="animate-fade-in space-y-5 max-w-container mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-secondary-200 rounded-xl p-5 shadow-card">
        <div>
          <h1 className="text-xl font-extrabold text-secondary-900 tracking-tight">Complaint Management Directory</h1>
          <p className="text-xs text-secondary-500 mt-1">
            Review, dispatch, and manage municipal grievances across all active wards
          </p>
        </div>

        <div className="text-xs font-bold text-primary-700 bg-primary-50 px-3 py-1.5 rounded-lg border border-primary-200">
          Showing {filtered.length} of {allComplaints.length} Grievances
        </div>
      </div>

      {/* Search & Filters Panel */}
      <div className="bg-white border border-secondary-200 rounded-xl p-4 space-y-3 shadow-card">
        <Input
          placeholder="Search by issue title, ID (#1), or department..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={Search}
          id="complaints-search"
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {/* Status Filter */}
          <div>
            <label className="block text-[11px] font-bold text-secondary-600 uppercase tracking-wider mb-1">
              Status Filter
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-secondary-50 border border-secondary-200 text-secondary-900 text-xs rounded-lg p-2 font-medium focus:ring-2 focus:ring-primary-500 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="open">Reported (Open)</option>
              <option value="verified">Verified</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-[11px] font-bold text-secondary-600 uppercase tracking-wider mb-1">
              Category Filter
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-secondary-50 border border-secondary-200 text-secondary-900 text-xs rounded-lg p-2 font-medium focus:ring-2 focus:ring-primary-500 focus:outline-none"
            >
              <option value="all">All Categories</option>
              {uniqueCategories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Pincode Filter */}
          <div>
            <label className="block text-[11px] font-bold text-secondary-600 uppercase tracking-wider mb-1">
              Pincode Zone
            </label>
            <select
              value={pincodeFilter}
              onChange={(e) => setPincodeFilter(e.target.value)}
              className="w-full bg-secondary-50 border border-secondary-200 text-secondary-900 text-xs rounded-lg p-2 font-medium focus:ring-2 focus:ring-primary-500 focus:outline-none"
            >
              <option value="all">All Pincodes</option>
              {uniquePincodes.map((pin) => (
                <option key={pin} value={pin}>📍 {pin}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-white rounded-xl border border-secondary-200 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-secondary-50 border-b border-secondary-200">
                <th className="px-3 py-3 text-left font-bold text-secondary-500 uppercase tracking-wider">ID</th>
                <th className="px-4 py-3 text-left font-bold text-secondary-500 uppercase tracking-wider">Title</th>
                <th className="px-3 py-3 text-left font-bold text-secondary-500 uppercase tracking-wider">Category</th>
                <th className="px-3 py-3 text-left font-bold text-secondary-500 uppercase tracking-wider">Status</th>
                <th className="px-3 py-3 text-left font-bold text-secondary-500 uppercase tracking-wider">Priority</th>
                <th className="px-3 py-3 text-left font-bold text-secondary-500 uppercase tracking-wider">Department</th>
                <th className="px-3 py-3 text-left font-bold text-secondary-500 uppercase tracking-wider">Pincode</th>
                <th className="px-3 py-3 text-center font-bold text-secondary-500 uppercase tracking-wider">Net Score</th>
                <th className="px-3 py-3 text-right font-bold text-secondary-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-10 text-secondary-500 font-medium">
                    No complaints match your search & filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => {
                  const votes = getComplaintVotes(c._id, c.upvotes, c.downvotes);
                  return (
                    <tr
                      key={c._id}
                      className="border-b border-secondary-100 last:border-0 hover:bg-secondary-50 transition-colors"
                    >
                      <td className="px-3 py-3 font-extrabold text-primary-700">#{c._id}</td>
                      <td className="px-4 py-3">
                        <Link
                          to={`/municipal/complaints/${c._id}`}
                          className="text-secondary-900 font-bold hover:text-primary-600 no-underline line-clamp-1 max-w-xs block"
                        >
                          {c.title}
                        </Link>
                      </td>
                      <td className="px-3 py-3"><CategoryBadge category={c.category || c.categorySlug} /></td>
                      <td className="px-3 py-3"><StatusBadge status={c.status} /></td>
                      <td className="px-3 py-3"><PriorityBadge priority={c.priority} /></td>
                      <td className="px-3 py-3 font-medium text-secondary-700 truncate max-w-[150px]">{c.department}</td>
                      <td className="px-3 py-3 font-mono font-bold text-secondary-600">📍 {c.pincode}</td>
                      <td className="px-3 py-3 text-center font-extrabold">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] ${votes.netScore > 0 ? 'bg-primary-50 text-primary-700 border border-primary-200' : 'bg-secondary-100 text-secondary-600'}`}>
                          {votes.netScore > 0 ? `+${votes.netScore}` : votes.netScore}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right">
                        <Link to={`/municipal/complaints/${c._id}`}>
                          <Button variant="outline" size="sm" className="font-bold text-[11px] py-1 px-2.5">
                            Manage <ArrowRight size={12} className="ml-1" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
