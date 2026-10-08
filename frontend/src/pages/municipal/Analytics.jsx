import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area
} from 'recharts';
import {
  PieChart as PieIcon, BarChart2, MapPin, Layers, Flame,
  ThumbsUp, ShieldCheck, Clock, CheckCircle2, TrendingUp, Filter, RefreshCw, Loader2, Lock, Shield
} from 'lucide-react';
import Button from '../../components/ui/Button';
import ApiClient from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const TOOLTIP_STYLE = {
  borderRadius: 10,
  border: '1px solid #E5E7EB',
  fontSize: 12,
  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  backgroundColor: '#FFFFFF',
};

export default function Analytics() {
  const { currentUser, login } = useAuth();
  const isStaffOrAdmin = currentUser && ['official', 'staff', 'admin'].includes(currentUser.role);

  const [pincodeFilter, setPincodeFilter] = useState('all');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quickLoginLoading, setQuickLoginLoading] = useState(false);

  const fetchAnalytics = useCallback(async () => {
    if (!isStaffOrAdmin) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (pincodeFilter !== 'all') params.pincode = pincodeFilter;
      const data = await ApiClient.getAdminAnalytics(params);
      setAnalyticsData(data);
    } catch (err) {
      console.error('Failed to fetch admin analytics:', err);
      setError(err.message || 'Failed to retrieve analytics from database.');
    } finally {
      setLoading(false);
    }
  }, [isStaffOrAdmin, pincodeFilter]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

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

  const charts = analyticsData?.charts || {};
  const avgResolution = analyticsData?.avgResolution || { hours: 0, label: 'N/A' };

  const categoryData = charts.byCategory || [];
  const pincodeData = charts.byPincode || [];
  const statusData = charts.byStatus || [];
  const priorityData = charts.byPriority || [];
  const deptData = charts.byDepartment || [];
  const monthlyData = charts.monthly || [];

  const totalComplaints = useMemo(() => {
    return categoryData.reduce((acc, c) => acc + (c.value || 0), 0);
  }, [categoryData]);

  const resolvedCount = useMemo(() => {
    const res = statusData.find(s => s.name.toLowerCase() === 'resolved');
    return res ? res.count : 0;
  }, [statusData]);

  const resolutionRatePct = totalComplaints > 0 ? Math.round((resolvedCount / totalComplaints) * 100) : 0;

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
              Analytics intelligence and historical SLA trends are restricted to municipal administrative accounts.
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
    <div className="animate-fade-in space-y-6 w-full pb-12">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-secondary-200 rounded-xl p-5 shadow-card">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-secondary-900 tracking-tight">Municipal Analytics & Intelligence</h1>
            <span className="px-2.5 py-0.5 bg-primary-50 text-primary-700 font-extrabold text-xs rounded-full border border-primary-200">
              POSTGRESQL AGGREGATED
            </span>
          </div>
          <p className="text-xs text-secondary-500 mt-1">
            Performance analytics, SLA resolution times, and ward volume computed dynamically in PostgreSQL
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-secondary-50 border border-secondary-200 rounded-lg p-1">
            <Filter size={13} className="text-secondary-400 ml-1.5" />
            <select
              value={pincodeFilter}
              onChange={(e) => setPincodeFilter(e.target.value)}
              className="bg-transparent text-secondary-900 text-xs font-bold focus:outline-none pr-2"
            >
              <option value="all">All Pincodes</option>
              {pincodeData.map(p => {
                const pin = p.pincode.replace(/[^0-9]/g, '');
                return <option key={pin} value={pin}>📍 {pin}</option>;
              })}
            </select>
          </div>

          <Button
            variant="ghost"
            size="sm"
            icon={RefreshCw}
            onClick={fetchAnalytics}
            loading={loading}
            className="text-xs font-bold text-secondary-600 hover:text-primary-600"
          >
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium flex items-center justify-between">
          <span>⚠ {error}</span>
          <Button size="xs" variant="outline" onClick={fetchAnalytics}>Retry</Button>
        </div>
      )}

      {/* ── KPI Summary Strip ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-secondary-200 rounded-xl p-4 shadow-card">
          <p className="text-xs font-bold text-secondary-400 uppercase tracking-wider">Total Grievances</p>
          <p className="text-2xl font-extrabold text-secondary-900 mt-1">{loading ? '—' : totalComplaints}</p>
          <p className="text-[11px] text-primary-700 font-semibold mt-0.5">Active database records</p>
        </div>

        <div className="bg-white border border-secondary-200 rounded-xl p-4 shadow-card">
          <p className="text-xs font-bold text-secondary-400 uppercase tracking-wider">Avg Resolution Time</p>
          <p className="text-2xl font-extrabold text-emerald-700 mt-1">{loading ? '—' : avgResolution.label}</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Resolved duration average</p>
        </div>

        <div className="bg-white border border-secondary-200 rounded-xl p-4 shadow-card">
          <p className="text-xs font-bold text-secondary-400 uppercase tracking-wider">Resolution Rate</p>
          <p className="text-2xl font-extrabold text-indigo-700 mt-1">{loading ? '—' : `${resolutionRatePct}%`}</p>
          <p className="text-[11px] text-indigo-600 font-semibold mt-0.5">{resolvedCount} cases closed successfully</p>
        </div>

        <div className="bg-white border border-secondary-200 rounded-xl p-4 shadow-card">
          <p className="text-xs font-bold text-secondary-400 uppercase tracking-wider">Active Categories</p>
          <p className="text-2xl font-extrabold text-primary-700 mt-1">{loading ? '—' : categoryData.length}</p>
          <p className="text-[11px] text-secondary-500 font-semibold mt-0.5">Municipal classifications</p>
        </div>
      </div>

      {/* ── Analytics Charts Section ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* 1. Complaints by Category */}
        <div className="bg-white rounded-xl border border-secondary-200 shadow-card p-5 space-y-4">
          <div className="border-b border-secondary-100 pb-3">
            <h3 className="text-sm font-extrabold text-secondary-900 flex items-center gap-2">
              <PieIcon size={16} className="text-primary-600" />
              1. Complaints by Category
            </h3>
            <p className="text-xs text-secondary-400">Distribution by infrastructure type</p>
          </div>

          <div className="h-52 flex items-center justify-center">
            {categoryData.length === 0 ? (
              <p className="text-xs text-secondary-400">No category telemetry available</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || '#2563EB'} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-1 max-h-40 overflow-y-auto">
            {categoryData.map((cat) => (
              <div key={cat.name} className="flex items-center justify-between bg-secondary-50 p-2 rounded-lg border border-secondary-100">
                <span className="flex items-center gap-1.5 text-secondary-700 font-semibold truncate">
                  <span className="w-2.5 h-2.5 rounded-full inline-block flex-shrink-0" style={{ backgroundColor: cat.color || '#2563EB' }} />
                  {cat.name}
                </span>
                <span className="font-extrabold text-secondary-900">{cat.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Complaints by Pincode */}
        <div className="bg-white rounded-xl border border-secondary-200 shadow-card p-5 space-y-4">
          <div className="border-b border-secondary-100 pb-3">
            <h3 className="text-sm font-extrabold text-secondary-900 flex items-center gap-2">
              <MapPin size={16} className="text-primary-600" />
              2. Complaints by Pincode Zone
            </h3>
            <p className="text-xs text-secondary-400">Grievance concentration across zones</p>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pincodeData} barSize={24}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                <XAxis dataKey="pincode" tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'rgba(37,99,235,0.04)' }} />
                <Bar dataKey="count" name="Complaints" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Complaints by Status */}
        <div className="bg-white rounded-xl border border-secondary-200 shadow-card p-5 space-y-4">
          <div className="border-b border-secondary-100 pb-3">
            <h3 className="text-sm font-extrabold text-secondary-900 flex items-center gap-2">
              <BarChart2 size={16} className="text-primary-600" />
              3. Resolution Pipeline Status
            </h3>
            <p className="text-xs text-secondary-400">Count in each operational phase</p>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData} barSize={26}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'rgba(37,99,235,0.04)' }} />
                <Bar dataKey="count" name="Grievances" fill="#2563EB" radius={[4, 4, 0, 0]}>
                  {statusData.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={entry.fill || '#2563EB'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. Priority Breakdown */}
        <div className="bg-white rounded-xl border border-secondary-200 shadow-card p-5 space-y-4">
          <div className="border-b border-secondary-100 pb-3">
            <h3 className="text-sm font-extrabold text-secondary-900 flex items-center gap-2">
              <Flame size={16} className="text-primary-600" />
              4. Priority Severity Distribution
            </h3>
            <p className="text-xs text-secondary-400">Severity tier volume breakdown</p>
          </div>

          <div className="h-52 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityData}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill || '#2563EB'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1">
            {priorityData.map((pr) => (
              <div key={pr.name} className="bg-secondary-50 p-2 rounded-lg border border-secondary-100 text-center">
                <span className="block text-[10px] font-bold text-secondary-500 uppercase">{pr.name}</span>
                <span className="text-base font-black text-secondary-900">{pr.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Department Distribution */}
        {deptData.length > 0 && (
          <div className="bg-white rounded-xl border border-secondary-200 shadow-card p-5 space-y-4 lg:col-span-2">
            <div className="border-b border-secondary-100 pb-3">
              <h3 className="text-sm font-extrabold text-secondary-900 flex items-center gap-2">
                <Layers size={16} className="text-primary-600" />
                5. Workload Distribution by Department
              </h3>
              <p className="text-xs text-secondary-400">Dispatched cases by municipal agency</p>
            </div>

            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptData} layout="vertical" barSize={16}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10, fill: '#6B7280' }} />
                  <YAxis type="category" dataKey="name" width={180} tick={{ fontSize: 10, fill: '#6B7280' }} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Bar dataKey="count" name="Complaints" fill="#4F46E5" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* 6. Monthly Trend */}
        {monthlyData.length > 0 && (
          <div className="bg-white rounded-xl border border-secondary-200 shadow-card p-5 space-y-4 lg:col-span-2">
            <div className="border-b border-secondary-100 pb-3">
              <h3 className="text-sm font-extrabold text-secondary-900 flex items-center gap-2">
                <TrendingUp size={16} className="text-primary-600" />
                6. Monthly Inflow & Resolution Trend
              </h3>
              <p className="text-xs text-secondary-400">Historical complaint intake vs resolved cases</p>
            </div>

            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="colorIntake" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#6B7280' }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#6B7280' }} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Area type="monotone" dataKey="complaints" name="Intake" stroke="#3B82F6" fillOpacity={1} fill="url(#colorIntake)" />
                  <Area type="monotone" dataKey="resolved" name="Resolved" stroke="#10B981" fillOpacity={1} fill="url(#colorResolved)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
