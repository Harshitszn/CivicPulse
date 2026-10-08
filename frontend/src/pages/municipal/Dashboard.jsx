import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText, Clock, AlertTriangle, CheckCircle2, TrendingUp,
  ArrowRight, Building2, MapPin, Filter, Layers, Zap, Flame,
  ShieldCheck, RefreshCw, BarChart2, Loader2, Lock, Shield
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { StatusBadge, CategoryBadge, PriorityBadge } from '../../components/ui/Badge';
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

export default function Dashboard() {
  const { currentUser, login } = useAuth();
  const isStaffOrAdmin = currentUser && ['official', 'staff', 'admin'].includes(currentUser.role);

  // ── Filters State ────────────────────────────────────────────────────────────
  const [pincodeFilter, setPincodeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // ── Database State ───────────────────────────────────────────────────────────
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quickLoginLoading, setQuickLoginLoading] = useState(false);

  // ── Fetch live database dashboard telemetry ──────────────────────────────────
  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (pincodeFilter !== 'all') params.pincode = pincodeFilter;
      const data = await ApiClient.getAdminDashboard(params);
      setDashboardData(data);
    } catch (err) {
      console.error('Failed to fetch admin dashboard:', err);
      setError(err.message || 'Failed to load dashboard statistics from PostgreSQL.');
    } finally {
      setLoading(false);
    }
  }, [pincodeFilter]);

  useEffect(() => {
    if (isStaffOrAdmin) {
      fetchDashboard();
    } else {
      setLoading(false);
    }
  }, [fetchDashboard, isStaffOrAdmin]);

  // Demo switch helper if user is not yet logged in as admin
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

  // ── Dynamic KPIs calculated strictly from PostgreSQL ────────────────────────
  const kpi = dashboardData?.kpi || {
    total: 0,
    pending: 0,
    in_progress: 0,
    resolved: 0,
    high_priority: 0,
    avg_resolution_label: 'N/A',
  };

  const KPI_CARDS = [
    {
      label: 'Total Complaints',
      value: kpi.total,
      subtext: 'Calculated from PostgreSQL',
      icon: FileText,
      color: 'text-primary-700',
      bg: 'bg-primary-50 border-primary-200',
    },
    {
      label: 'Pending',
      value: kpi.pending,
      subtext: 'Reported, verified & assigned',
      icon: Clock,
      color: 'text-amber-700',
      bg: 'bg-amber-50 border-amber-200',
    },
    {
      label: 'In Progress',
      value: kpi.in_progress,
      subtext: 'Active field crews dispatched',
      icon: Flame,
      color: 'text-indigo-700',
      bg: 'bg-indigo-50 border-indigo-200',
    },
    {
      label: 'Resolved',
      value: kpi.resolved,
      subtext: 'Closed in database',
      icon: CheckCircle2,
      color: 'text-emerald-700',
      bg: 'bg-emerald-50 border-emerald-200',
    },
    {
      label: 'High Priority',
      value: kpi.high_priority,
      subtext: 'Urgent & high severity cases',
      icon: AlertTriangle,
      color: 'text-red-700',
      bg: 'bg-red-50 border-red-200',
    },
    {
      label: 'Avg Resolution Time',
      value: kpi.avg_resolution_label || 'N/A',
      subtext: 'Database resolved_at duration',
      icon: TrendingUp,
      color: 'text-cyan-700',
      bg: 'bg-cyan-50 border-cyan-200',
    },
  ];

  // ── Live Chart Data from PostgreSQL ──────────────────────────────────────────
  const categoryData = dashboardData?.charts?.byCategory || [];
  const statusData = dashboardData?.charts?.byStatus || [];
  const pincodeData = dashboardData?.charts?.byPincode || [];

  // Pincode filter options
  const uniquePincodes = useMemo(() => {
    const list = pincodeData.map(p => p.pincode.replace(/[^0-9]/g, '')).filter(Boolean);
    return Array.from(new Set(list)).sort();
  }, [pincodeData]);

  // Unique categories from live breakdown
  const uniqueCategories = useMemo(() => {
    return categoryData.map(c => c.name);
  }, [categoryData]);

  // Complaints list from API
  const complaintsList = dashboardData?.recentComplaints || [];

  // Filtered Complaints for Table
  const filteredComplaints = useMemo(() => {
    return complaintsList.filter((c) => {
      const matchCat = categoryFilter === 'all' || (c.category && c.category.toLowerCase().includes(categoryFilter.toLowerCase()));
      const matchDept = deptFilter === 'all' || c.department === deptFilter;
      const matchPriority = priorityFilter === 'all' || (c.priority && c.priority.toLowerCase() === priorityFilter.toLowerCase());
      const matchStatus = statusFilter === 'all' || (c.status && c.status.toLowerCase() === statusFilter.toLowerCase());
      return matchCat && matchDept && matchPriority && matchStatus;
    });
  }, [complaintsList, categoryFilter, deptFilter, priorityFilter, statusFilter]);

  const uniqueDepartments = useMemo(() => {
    return Array.from(new Set(complaintsList.map((c) => c.department).filter(Boolean))).sort();
  }, [complaintsList]);

  const isAnyFilterActive =
    pincodeFilter !== 'all' ||
    categoryFilter !== 'all' ||
    deptFilter !== 'all' ||
    priorityFilter !== 'all' ||
    statusFilter !== 'all';

  const resetFilters = () => {
    setPincodeFilter('all');
    setCategoryFilter('all');
    setDeptFilter('all');
    setPriorityFilter('all');
    setStatusFilter('all');
  };

  // ── Access Denied / Auth Required State ──────────────────────────────────────
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
              The Municipal Command Center contains restricted civic infrastructure operations and PostgreSQL telemetry.
              Only verified municipal staff and administrators can access this view.
            </p>
            {currentUser && (
              <p className="text-xs text-amber-700 bg-amber-50 inline-block px-3 py-1 rounded-full border border-amber-200 font-semibold">
                Current role: <strong>{currentUser.role}</strong> ({currentUser.email}) — Access Restricted
              </p>
            )}
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
            <Button
              variant="outline"
              size="lg"
              loading={quickLoginLoading}
              onClick={() => handleQuickDemoLogin('admin@civicpulse.org')}
              className="text-xs font-bold"
            >
              Demo: Quick Sign In as Admin
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6 w-full pb-12">
      {/* Title & Operations Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-secondary-200 rounded-xl p-5 shadow-card">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-secondary-900 tracking-tight">Municipal Command Center</h1>
            <span className="px-2.5 py-0.5 bg-primary-50 text-primary-700 font-extrabold text-xs rounded-full border border-primary-200 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              POSTGRESQL TELEMETRY
            </span>
          </div>
          <p className="text-xs text-secondary-500 mt-1">
            Real-time municipal grievance operations • Derived dynamically from PostgreSQL database
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            icon={RefreshCw}
            onClick={fetchDashboard}
            loading={loading}
            className="text-xs font-bold text-secondary-600 hover:text-primary-600"
          >
            Refresh Data
          </Button>
          <Link to="/municipal/complaints">
            <Button variant="primary" size="sm" icon={ArrowRight} className="font-bold text-xs">
              Manage Complaints ({kpi.total})
            </Button>
          </Link>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium flex items-center justify-between">
          <span>⚠ {error}</span>
          <Button size="xs" variant="outline" onClick={fetchDashboard}>Retry</Button>
        </div>
      )}

      {/* ── 6 KPI Cards Grid ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {KPI_CARDS.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className={`bg-white border rounded-xl p-4 shadow-card hover:shadow-raised transition-all ${item.bg}`}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon size={18} className={item.color} />
                <span className="text-[10px] font-extrabold text-secondary-400 uppercase tracking-wider">Metric</span>
              </div>
              <p className="text-2xl font-extrabold text-secondary-900 leading-tight">
                {loading ? '—' : item.value}
              </p>
              <p className="text-xs font-bold text-secondary-800 truncate mt-0.5">{item.label}</p>
              <p className="text-[10px] text-secondary-500 font-medium mt-1 truncate">{item.subtext}</p>
            </div>
          );
        })}
      </div>

      {/* ── 3 Operational Charts Section ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Chart 1: Complaints by Category */}
        <div className="bg-white rounded-xl border border-secondary-200 shadow-card p-5 space-y-4">
          <div className="border-b border-secondary-100 pb-3">
            <h3 className="text-sm font-extrabold text-secondary-900 flex items-center gap-2">
              <PieChart size={16} className="text-primary-600" />
              Complaints by Category
            </h3>
            <p className="text-xs text-secondary-400">PostgreSQL aggregation by category</p>
          </div>

          <div className="h-44 flex items-center justify-center">
            {categoryData.length === 0 ? (
              <p className="text-xs text-secondary-400">No categories recorded yet</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={42}
                    outerRadius={68}
                    paddingAngle={3}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || '#2563EB'} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="space-y-1.5 text-xs max-h-36 overflow-y-auto pr-1">
            {categoryData.map((cat) => (
              <div key={cat.name} className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-secondary-600 font-medium truncate max-w-[170px]">
                  <span className="w-2.5 h-2.5 rounded-full inline-block flex-shrink-0" style={{ backgroundColor: cat.color || '#2563EB' }} />
                  {cat.name}
                </span>
                <span className="font-bold text-secondary-900">{cat.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 2: Complaints by Status */}
        <div className="bg-white rounded-xl border border-secondary-200 shadow-card p-5 space-y-4">
          <div className="border-b border-secondary-100 pb-3">
            <h3 className="text-sm font-extrabold text-secondary-900 flex items-center gap-2">
              <BarChart2 size={16} className="text-primary-600" />
              Complaints by Status
            </h3>
            <p className="text-xs text-secondary-400">Progression pipeline from Reported to Resolved</p>
          </div>

          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={statusData} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 11 }}
                cursor={{ fill: 'rgba(37,99,235,0.04)' }}
              />
              <Bar dataKey="count" name="Complaints" fill="#2563EB" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 3: Complaints by Pincode */}
        <div className="bg-white rounded-xl border border-secondary-200 shadow-card p-5 space-y-4">
          <div className="border-b border-secondary-100 pb-3">
            <h3 className="text-sm font-extrabold text-secondary-900 flex items-center gap-2">
              <MapPin size={16} className="text-primary-600" />
              Complaints by Pincode
            </h3>
            <p className="text-xs text-secondary-400">Volume across registered municipal pincode zones</p>
          </div>

          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={pincodeData} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
              <XAxis dataKey="pincode" tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 11 }}
                cursor={{ fill: 'rgba(37,99,235,0.04)' }}
              />
              <Bar dataKey="count" name="Complaints" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── 5 Filters Control Panel ────────────────────────────────────────────── */}
      <div className="bg-white border border-secondary-200 rounded-xl p-5 shadow-card space-y-3">
        <div className="flex items-center justify-between border-b border-secondary-100 pb-3">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-primary-600" />
            <h3 className="text-sm font-extrabold text-secondary-900">Operational Filters</h3>
            <span className="text-xs text-secondary-400">Filter complaints by 5 exact criteria</span>
          </div>

          {isAnyFilterActive && (
            <button
              onClick={resetFilters}
              className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1 bg-primary-50 px-2.5 py-1 rounded-md border border-primary-200"
            >
              <RefreshCw size={12} /> Reset Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {/* Filter 1: Pincode */}
          <div>
            <label className="block text-[11px] font-bold text-secondary-600 uppercase tracking-wider mb-1">
              Pincode
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

          {/* Filter 2: Category */}
          <div>
            <label className="block text-[11px] font-bold text-secondary-600 uppercase tracking-wider mb-1">
              Category
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

          {/* Filter 3: Department */}
          <div>
            <label className="block text-[11px] font-bold text-secondary-600 uppercase tracking-wider mb-1">
              Department
            </label>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="w-full bg-secondary-50 border border-secondary-200 text-secondary-900 text-xs rounded-lg p-2 font-medium focus:ring-2 focus:ring-primary-500 focus:outline-none"
            >
              <option value="all">All Departments</option>
              {uniqueDepartments.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          {/* Filter 4: Priority */}
          <div>
            <label className="block text-[11px] font-bold text-secondary-600 uppercase tracking-wider mb-1">
              Priority
            </label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full bg-secondary-50 border border-secondary-200 text-secondary-900 text-xs rounded-lg p-2 font-medium focus:ring-2 focus:ring-primary-500 focus:outline-none"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Filter 5: Status */}
          <div>
            <label className="block text-[11px] font-bold text-secondary-600 uppercase tracking-wider mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
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
        </div>
      </div>

      {/* ── Recent Complaint Table (9 Columns Required) ─────────────────────── */}
      <div className="bg-white rounded-xl border border-secondary-200 shadow-card overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border-b border-secondary-100 gap-2">
          <div>
            <h3 className="text-sm font-extrabold text-secondary-900 flex items-center gap-2">
              <Layers size={16} className="text-primary-600" />
              Recent Complaint Operations Table
            </h3>
            <p className="text-xs text-secondary-400">
              Showing {filteredComplaints.length} of {complaintsList.length} grievances • Dynamically calculated from PostgreSQL
            </p>
          </div>

          <span className="text-xs font-bold text-secondary-500">
            9 Operational Data Columns
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-secondary-50 border-b border-secondary-200">
                <th className="px-3 py-3 text-left font-bold text-secondary-500 uppercase tracking-wider">ID</th>
                <th className="px-3 py-3 text-left font-bold text-secondary-500 uppercase tracking-wider">Category</th>
                <th className="px-3 py-3 text-left font-bold text-secondary-500 uppercase tracking-wider">Pincode</th>
                <th className="px-3 py-3 text-left font-bold text-secondary-500 uppercase tracking-wider">Priority</th>
                <th className="px-3 py-3 text-left font-bold text-secondary-500 uppercase tracking-wider">Department</th>
                <th className="px-3 py-3 text-left font-bold text-secondary-500 uppercase tracking-wider">Status</th>
                <th className="px-3 py-3 text-center font-bold text-secondary-500 uppercase tracking-wider">Vote Score</th>
                <th className="px-3 py-3 text-left font-bold text-secondary-500 uppercase tracking-wider">Created</th>
                <th className="px-3 py-3 text-left font-bold text-secondary-500 uppercase tracking-wider">Municipal Status</th>
              </tr>
            </thead>
            <tbody>
              {loading && complaintsList.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-secondary-500 font-medium">
                    <Loader2 size={20} className="animate-spin inline-block mr-2 text-primary-600" />
                    Loading database telemetry...
                  </td>
                </tr>
              ) : filteredComplaints.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-secondary-500 font-medium">
                    No complaints match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                filteredComplaints.map((c) => {
                  const compId = c.id || c._id;
                  const netScore = (c.upvotes_count ?? c.upvotes ?? 0) - (c.downvotes_count ?? c.downvotes ?? 0);

                  return (
                    <tr
                      key={compId}
                      className="border-b border-secondary-100 last:border-0 hover:bg-secondary-50 transition-colors"
                    >
                      {/* 1. ID */}
                      <td className="px-3 py-3 font-extrabold text-primary-700">
                        <Link
                          to={`/municipal/complaints/${compId}`}
                          className="no-underline hover:underline"
                        >
                          #{String(compId).slice(0, 8)}
                        </Link>
                      </td>

                      {/* 2. Category */}
                      <td className="px-3 py-3">
                        <CategoryBadge category={c.category || c.categorySlug} />
                      </td>

                      {/* 3. Pincode */}
                      <td className="px-3 py-3 font-mono font-bold text-secondary-700">
                        📍 {c.pincode}
                      </td>

                      {/* 4. Priority */}
                      <td className="px-3 py-3">
                        <PriorityBadge priority={c.priority} />
                      </td>

                      {/* 5. Department */}
                      <td className="px-3 py-3 font-medium text-secondary-800 truncate max-w-[160px]" title={c.department || c.assigned_department}>
                        {c.department || c.assigned_department || 'General Administration'}
                      </td>

                      {/* 6. Status */}
                      <td className="px-3 py-3">
                        <StatusBadge status={c.status} />
                      </td>

                      {/* 7. Vote Score */}
                      <td className="px-3 py-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full font-extrabold text-[11px] ${
                            netScore > 0
                              ? 'bg-primary-50 text-primary-700 border border-primary-200'
                              : netScore < 0
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : 'bg-secondary-100 text-secondary-600'
                          }`}
                        >
                          {netScore > 0 ? `+${netScore}` : netScore}
                        </span>
                      </td>

                      {/* 8. Created */}
                      <td className="px-3 py-3 text-secondary-500 font-medium whitespace-nowrap">
                        {timeAgo(c.created_at || c.createdAt)}
                      </td>

                      {/* 9. Municipal Status Flag */}
                      <td className="px-3 py-3 font-bold whitespace-nowrap">
                        {c.flagged_for_review ? (
                          <span className="text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200 flex items-center gap-1 w-fit">
                            ⚠ Flagged ({c.dispute_count || 0} disputes)
                          </span>
                        ) : (
                          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1 w-fit">
                            ✓ Verified Active
                          </span>
                        )}
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
