import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowRight, MapPin, Building2, Layers, Loader2, RefreshCw, ChevronLeft, ChevronRight, Lock, Shield } from 'lucide-react';
import { StatusBadge, CategoryBadge, PriorityBadge } from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import ApiClient from '../../services/api';
import { useAuth } from '../../context/AuthContext';

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
  const { currentUser, login } = useAuth();
  const isStaffOrAdmin = currentUser && ['official', 'staff', 'admin'].includes(currentUser.role);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [pincodeFilter, setPincodeFilter] = useState('all');
  const [page, setPage] = useState(1);
  const limit = 20;

  const [complaints, setComplaints] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quickLoginLoading, setQuickLoginLoading] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch complaints from PostgreSQL
  const fetchComplaints = useCallback(async () => {
    if (!isStaffOrAdmin) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit,
      };
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      if (statusFilter !== 'all') params.status = statusFilter;
      if (categoryFilter !== 'all') params.category = categoryFilter;
      if (pincodeFilter !== 'all') params.pincode = pincodeFilter;

      const res = await ApiClient.getAdminComplaints(params);
      const list = Array.isArray(res) ? res : (res?.complaints || []);
      setComplaints(list);
      setPagination(res?.pagination || { page, limit, total: list.length, totalPages: 1 });
    } catch (err) {
      console.error('Failed to fetch admin complaints:', err);
      setError(err.message || 'Failed to fetch complaints directory.');
    } finally {
      setLoading(false);
    }
  }, [isStaffOrAdmin, page, limit, debouncedSearch, statusFilter, categoryFilter, pincodeFilter]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  // Demo sign-in helper
  const handleQuickDemoLogin = async (email) => {
    setQuickLoginLoading(true);
    try {
      await login({ email, password: 'password123' });
    } catch (err) {
      console.error('Quick login failed:', err);
    } finally {
      setQuickLoginLoading(false);
    }
  };

  if (!isStaffOrAdmin) {
    return (
      <div className="animate-fade-in space-y-6 w-full max-w-4xl mx-auto py-12">
        <div className="bg-white border-2 border-primary-200 rounded-2xl p-8 shadow-raised text-center space-y-6">
          <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto text-primary-600">
            <Lock size={32} />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-black text-secondary-900 tracking-tight">
              Administrative Authentication Required
            </h1>
            <p className="text-sm text-secondary-600 max-w-lg mx-auto">
              You must be logged in as an authorized municipal officer or administrator to manage grievances.
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/municipal/login">
              <Button variant="primary" size="lg" icon={Shield} className="font-bold text-sm">
                Sign In to Official Account
              </Button>
            </Link>

            <Button
              variant="secondary"
              size="lg"
              loading={quickLoginLoading}
              onClick={() => handleQuickDemoLogin('officer.verma@ndmc.gov.in')}
              className="text-xs font-bold"
            >
              Demo: Quick Sign In as Officer Verma
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-5 w-full pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-secondary-200 rounded-xl p-5 shadow-card">
        <div>
          <h1 className="text-xl font-extrabold text-secondary-900 tracking-tight">Complaint Management Directory</h1>
          <p className="text-xs text-secondary-500 mt-1">
            Review, dispatch, and manage municipal grievances across all active wards from PostgreSQL
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            icon={RefreshCw}
            onClick={fetchComplaints}
            loading={loading}
            className="text-xs font-bold text-secondary-600 hover:text-primary-600"
          >
            Refresh
          </Button>
          <div className="text-xs font-bold text-primary-700 bg-primary-50 px-3 py-1.5 rounded-lg border border-primary-200">
            Showing {complaints.length} of {pagination.total} Grievances
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium flex items-center justify-between">
          <span>⚠ {error}</span>
          <Button size="xs" variant="outline" onClick={fetchComplaints}>Retry</Button>
        </div>
      )}

      {/* Search & Filters Panel */}
      <div className="bg-white border border-secondary-200 rounded-xl p-4 space-y-3 shadow-card">
        <Input
          placeholder="Search by issue title, ID, or department..."
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
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full bg-secondary-50 border border-secondary-200 text-secondary-900 text-xs rounded-lg p-2 font-medium focus:ring-2 focus:ring-primary-500 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="reported">Reported</option>
              <option value="verified">Verified</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="reopened">Reopened</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-[11px] font-bold text-secondary-600 uppercase tracking-wider mb-1">
              Category Filter
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className="w-full bg-secondary-50 border border-secondary-200 text-secondary-900 text-xs rounded-lg p-2 font-medium focus:ring-2 focus:ring-primary-500 focus:outline-none"
            >
              <option value="all">All Categories</option>
              <option value="Roads">Roads & Potholes</option>
              <option value="Water">Water Supply</option>
              <option value="Sanitation">Sanitation & Garbage</option>
              <option value="Electricity">Electricity & Lighting</option>
              <option value="Drainage">Drainage & Sewage</option>
              <option value="Traffic">Traffic & Signals</option>
              <option value="Parks">Parks & Horticulture</option>
            </select>
          </div>

          {/* Pincode Filter */}
          <div>
            <label className="block text-[11px] font-bold text-secondary-600 uppercase tracking-wider mb-1">
              Pincode Zone
            </label>
            <input
              type="text"
              placeholder="e.g. 110001 (or 'all')"
              value={pincodeFilter === 'all' ? '' : pincodeFilter}
              onChange={(e) => {
                const val = e.target.value.trim();
                setPincodeFilter(val ? val : 'all');
                setPage(1);
              }}
              className="w-full bg-secondary-50 border border-secondary-200 text-secondary-900 text-xs rounded-lg p-2 font-medium focus:ring-2 focus:ring-primary-500 focus:outline-none"
            />
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
              {loading && complaints.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-secondary-500 font-medium">
                    <Loader2 size={22} className="animate-spin inline-block mr-2 text-primary-600" />
                    Loading grievances from PostgreSQL...
                  </td>
                </tr>
              ) : complaints.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-10 text-secondary-500 font-medium">
                    No complaints match your search & filter criteria.
                  </td>
                </tr>
              ) : (
                complaints.map((c) => {
                  const compId = c.id || c._id;
                  const netScore = (c.upvotes_count ?? c.upvotes ?? 0) - (c.downvotes_count ?? c.downvotes ?? 0);

                  return (
                    <tr
                      key={compId}
                      className="border-b border-secondary-100 last:border-0 hover:bg-secondary-50 transition-colors"
                    >
                      <td className="px-3 py-3 font-extrabold text-primary-700">#{String(compId).slice(0, 8)}</td>
                      <td className="px-4 py-3">
                        <Link
                          to={`/municipal/complaints/${compId}`}
                          className="text-secondary-900 font-bold hover:text-primary-600 no-underline line-clamp-1 max-w-xs block"
                        >
                          {c.title}
                        </Link>
                      </td>
                      <td className="px-3 py-3"><CategoryBadge category={c.category || c.categorySlug} /></td>
                      <td className="px-3 py-3"><StatusBadge status={c.status} /></td>
                      <td className="px-3 py-3"><PriorityBadge priority={c.priority} /></td>
                      <td className="px-3 py-3 font-medium text-secondary-700 truncate max-w-[150px]">{c.department || c.assigned_department}</td>
                      <td className="px-3 py-3 font-mono font-bold text-secondary-600">📍 {c.pincode}</td>
                      <td className="px-3 py-3 text-center font-extrabold">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] ${netScore > 0 ? 'bg-primary-50 text-primary-700 border border-primary-200' : 'bg-secondary-100 text-secondary-600'}`}>
                          {netScore > 0 ? `+${netScore}` : netScore}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right">
                        <Link to={`/municipal/complaints/${compId}`}>
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

        {/* Pagination bar */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-secondary-100 bg-secondary-50/50">
            <span className="text-xs text-secondary-500 font-medium">
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                icon={ChevronLeft}
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= pagination.totalPages || loading}
                onClick={() => setPage((p) => p + 1)}
              >
                Next <ChevronRight size={14} className="ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
