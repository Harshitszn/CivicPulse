import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import {
  BarChart2,
  MapPin,
  Search,
  TrendingUp,
  Activity,
  CheckCircle2,
  Clock,
  Flame,
  ThumbsUp,
  RefreshCw,
  Info,
  Layers,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  Building2,
  Loader2,
  ArrowRight,
  HelpCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import ApiClient from '../../services/api';

// ── Locality & Demo Pincodes Metadata ─────────────────────────────────────────

export const SELECTABLE_LOCALITIES = [
  { code: 'all',    name: 'All Zones',       ward: 'Combined Municipal Dataset', city: 'National' },
  { code: '400064', name: 'Malad West',     ward: 'Ward 47 · P/North Ward',      city: 'Mumbai' },
  { code: '400067', name: 'Kandivali West', ward: 'Ward 31 · R/South Ward',      city: 'Mumbai' },
  { code: '400076', name: 'Powai',          ward: 'Ward 12 · S Ward',            city: 'Mumbai' },
  { code: '400054', name: 'Santacruz West', ward: 'Ward 84 · H/West Ward',      city: 'Mumbai' },
  { code: '110001', name: 'Connaught Place',ward: 'Ward 01 · Central Zone',      city: 'New Delhi' },
];

const CUSTOM_TOOLTIP_STYLE = {
  borderRadius: 8,
  border: '1px solid #E5E7EB',
  fontSize: 12,
  backgroundColor: '#FFFFFF',
  padding: '6px 10px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
};

// ── Reusable KPI Card ─────────────────────────────────────────────────────────

function KpiCard({
  label, value, sub, icon: Icon, iconBg, iconColor,
  valueColor = 'text-secondary-900', badge,
}) {
  return (
    <div className="relative flex flex-col justify-between p-4 rounded-2xl border border-secondary-200 bg-surface transition-all hover:shadow-md group">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
          <Icon size={16} className={iconColor} />
        </div>
        {badge && <div className="ml-2">{badge}</div>}
      </div>

      <div>
        <p className={`text-2xl font-black leading-none ${valueColor}`}>{value}</p>
        {sub && (
          <p className="text-[11px] text-secondary-400 font-medium mt-0.5">{sub}</p>
        )}
      </div>

      <p className="text-xs font-semibold text-secondary-600 mt-2 leading-snug">{label}</p>
    </div>
  );
}

// ── Resolution Rate Progress Bar ───────────────────────────────────────────────

function ResolutionRateBar({ rate, label = 'Resolution Rate' }) {
  const color = rate >= 70 ? '#16A34A' : rate >= 50 ? '#2563EB' : rate >= 35 ? '#D97706' : '#DC2626';
  return (
    <div>
      <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
        <span className="text-secondary-600">{label}</span>
        <span style={{ color }} className="text-sm font-black">{rate}%</span>
      </div>
      <div className="w-full bg-secondary-100 rounded-full h-2.5 overflow-hidden">
        <div
          className="h-2.5 rounded-full transition-all duration-700"
          style={{ width: `${Math.min(rate, 100)}%`, backgroundColor: color }}
        />
      </div>
      <p className="text-[10px] text-secondary-400 mt-1">
        {rate >= 70 ? '✓ Above civic benchmark' : rate >= 50 ? '→ At civic benchmark' : '⚠ Below civic benchmark'}
      </p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── 1. Overview Tab Component
// ═══════════════════════════════════════════════════════════════════════════════

function OverviewSection({ overview, loading, error, onRetry, localityName, pincode }) {
  const [showMethodologyModal, setShowMethodologyModal] = useState(false);

  if (loading && !overview) {
    return (
      <div className="py-24 text-center space-y-3">
        <Loader2 size={32} className="animate-spin text-primary-600 mx-auto" />
        <p className="text-xs font-bold text-secondary-600">Calculating PostgreSQL analytics for {localityName}...</p>
      </div>
    );
  }

  if (error || !overview) {
    return (
      <div className="p-8 bg-red-50 border border-red-200 rounded-2xl text-center space-y-3 max-w-md mx-auto my-12">
        <AlertTriangle size={28} className="text-red-500 mx-auto" />
        <h3 className="text-sm font-bold text-red-900">Failed to Load Overview</h3>
        <p className="text-xs text-red-600">{error || 'Unable to retrieve statistics from the database.'}</p>
        <Button size="sm" variant="outline" onClick={onRetry}>Retry</Button>
      </div>
    );
  }

  const {
    totalComplaints = 0,
    resolved = 0,
    pending = 0,
    inProgress = 0,
    resolutionRate = 0,
    avgResolutionTime = { label: 'N/A' },
    topCommunityPriorities = { categories: [], issues: [] },
    needsAttention = { count: 0, items: [] },
    civicPulseScore = { score: 75, label: 'Moderate' },
  } = overview;

  const prioritiesList = topCommunityPriorities.issues || [];
  const topCategories = topCommunityPriorities.categories || [];
  const attentionItems = needsAttention.items || [];

  return (
    <div className="space-y-6">
      {/* ── CivicPulse Score Banner ── */}
      <Card variant="flat" className="p-5 sm:p-6 border-primary-200 bg-gradient-to-br from-primary-50/70 via-surface to-indigo-50/40 relative overflow-hidden shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-primary-100 text-primary-700 text-[10px] font-extrabold uppercase tracking-wider border border-primary-200">
                Authoritative Index
              </span>
              <span className="text-[11px] text-secondary-500 font-semibold">
                PostgreSQL Aggregated Telemetry
              </span>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-4xl sm:text-5xl font-black text-secondary-900 tracking-tight">
                {civicPulseScore.score}
              </span>
              <span className="text-lg font-bold text-secondary-400">/ 100</span>
              <span className="text-xs font-bold text-primary-700 bg-white px-2.5 py-1 rounded-full border border-primary-200 shadow-xs">
                {civicPulseScore.label}
              </span>
            </div>

            <h2 className="text-sm sm:text-base font-bold text-secondary-800 leading-snug">
              CivicPulse Health Score for <strong>{localityName} ({pincode === 'all' ? 'All Zones' : pincode})</strong>
            </h2>
            <p className="text-xs text-secondary-600 leading-relaxed font-medium">
              Calculated dynamically from resolution rate ({resolutionRate}%), turnaround speed ({avgResolutionTime.label}), and community verification integrity.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-xs p-4 rounded-2xl border border-secondary-200 text-xs space-y-2 sm:min-w-[220px]">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-secondary-400 block mb-1">
              Score Breakdown Factors
            </span>
            <div className="flex justify-between font-medium">
              <span className="text-secondary-600">Resolution SLA:</span>
              <strong className="text-secondary-900">{resolutionRate}%</strong>
            </div>
            <div className="flex justify-between font-medium">
              <span className="text-secondary-600">Avg Resolution:</span>
              <strong className="text-secondary-900">{avgResolutionTime.label}</strong>
            </div>
            <div className="flex justify-between font-medium">
              <span className="text-secondary-600">Attention Items:</span>
              <strong className="text-red-700">{needsAttention.count}</strong>
            </div>
            <div className="pt-2 border-t border-secondary-100 flex items-center justify-between text-[11px] text-emerald-700 font-bold">
              <span>Trend:</span>
              <span>{civicPulseScore.delta || '+3.8%'}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* ── 4 Current Snapshot KPI Cards ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-secondary-600">
            Current Snapshot Metrics
          </h3>
          <span className="text-[11px] font-bold text-secondary-400">
            {localityName} ({pincode})
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <KpiCard
            label="Total Complaints"
            value={totalComplaints.toLocaleString()}
            sub="All recorded grievances"
            icon={BarChart2}
            iconBg="bg-primary-50"
            iconColor="text-primary-600"
          />

          <KpiCard
            label="Resolved"
            value={resolved.toLocaleString()}
            sub={`${resolutionRate}% successfully closed`}
            icon={CheckCircle2}
            iconBg="bg-green-50"
            iconColor="text-success"
            valueColor="text-success"
          />

          <KpiCard
            label="In Progress"
            value={inProgress.toLocaleString()}
            sub="Field crews assigned"
            icon={Flame}
            iconBg="bg-indigo-50"
            iconColor="text-indigo-600"
            valueColor="text-indigo-700"
          />

          <KpiCard
            label="Pending"
            value={pending.toLocaleString()}
            sub="Awaiting resolution"
            icon={Clock}
            iconBg="bg-amber-50"
            iconColor="text-amber-600"
            valueColor="text-amber-700"
          />
        </div>
      </div>

      {/* ── Resolution Rate & SLA Card ── */}
      <Card variant="flat" className="p-4 sm:p-5 border-secondary-200 bg-surface">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <ResolutionRateBar rate={resolutionRate} label="Overall Grievance Resolution Rate" />
          <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 md:border-l border-secondary-100 pt-3 md:pt-0 md:pl-6 text-xs">
            <div>
              <span className="text-secondary-400 text-[10px] font-bold uppercase tracking-wider block">Average Resolution Time</span>
              <span className="text-xl font-black text-secondary-900 mt-0.5 block">{avgResolutionTime.label}</span>
              <span className="text-[10px] text-secondary-500 font-medium">Turnaround from report to closure</span>
            </div>
            <div className="text-right">
              <span className="text-secondary-400 text-[10px] font-bold uppercase tracking-wider block">Active Categories</span>
              <span className="text-xl font-black text-primary-700 mt-0.5 block">{topCategories.length}</span>
              <span className="text-[10px] text-secondary-500 font-medium">Municipal sectors active</span>
            </div>
          </div>
        </div>
      </Card>

      {/* ── Top Community Priorities & Needs Attention Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top Priorities */}
        <Card variant="flat" className="p-4 sm:p-5 border-secondary-200 bg-surface space-y-3">
          <div className="flex items-center justify-between border-b border-secondary-100 pb-2">
            <div className="flex items-center gap-2">
              <Flame size={15} className="text-primary-600" />
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-secondary-900">
                Top Community Priorities
              </h3>
            </div>
            <span className="text-[10px] text-secondary-400 font-semibold">
              Highest Grievance Volume
            </span>
          </div>

          <div className="space-y-2">
            {topCategories.slice(0, 4).map((cat, idx) => (
              <div
                key={cat.category}
                className="p-3 rounded-xl bg-secondary-50/70 border border-secondary-100 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-primary-100 text-primary-700 font-black text-[10px] flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <div>
                    <strong className="text-secondary-900 font-bold block">{cat.category}</strong>
                    <span className="text-[10px] text-secondary-500 font-medium">
                      {cat.total} reports · {cat.resolved} resolved ({cat.resolutionRate}%)
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-black text-primary-700 bg-primary-50 px-2 py-0.5 rounded border border-primary-200">
                    ▲ {cat.netVotes || cat.total} score
                  </span>
                </div>
              </div>
            ))}
          </div>

          {prioritiesList.length > 0 && (
            <div className="pt-2 border-t border-secondary-100">
              <span className="text-[10px] uppercase font-bold text-secondary-400 block mb-2">
                Top Active Citizen Reports
              </span>
              <div className="space-y-1.5">
                {prioritiesList.slice(0, 3).map((item) => (
                  <Link
                    key={item.id}
                    to={`/complaint/${item.id}`}
                    className="block p-2 rounded-lg hover:bg-secondary-50 transition-colors text-xs text-secondary-800 font-semibold no-underline truncate flex items-center justify-between"
                  >
                    <span className="truncate pr-2">• {item.title}</span>
                    <span className="text-[10px] font-bold text-primary-600 flex-shrink-0">
                      +{item.netScore} votes →
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Needs Attention */}
        <Card variant="flat" className="p-4 sm:p-5 border-secondary-200 bg-surface space-y-3">
          <div className="flex items-center justify-between border-b border-secondary-100 pb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle size={15} className="text-error" />
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-secondary-900">
                Needs Attention ({needsAttention.count})
              </h3>
            </div>
            <span className="text-[10px] font-extrabold text-error bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
              Urgent / Flagged Issues
            </span>
          </div>

          <div className="space-y-2">
            {attentionItems.length === 0 ? (
              <p className="text-xs text-secondary-500 italic py-4 text-center">
                ✓ No critical backlogs or unresolved flagged disputes in this sector.
              </p>
            ) : (
              attentionItems.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-red-50/40 border border-red-100 space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-secondary-900 truncate max-w-[240px]">
                      {item.title}
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-red-100 text-red-800 border border-red-200 uppercase">
                      {item.flagged ? '⚠ Disputed' : item.priority}
                    </span>
                  </div>
                  <p className="text-[11px] text-red-700 font-medium">{item.reason}</p>
                  <div className="flex items-center justify-between text-[10px] text-secondary-500 pt-1">
                    <span>{item.category} · PIN {item.pincode}</span>
                    <Link to={`/complaint/${item.id}`} className="font-bold text-primary-600 hover:underline">
                      View Report →
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── 2. Civic Record Tab Component (2022–2026 Historical Dynamics)
// ═══════════════════════════════════════════════════════════════════════════════

function CivicRecordSection({ recordData, loading, error, onRetry, localityName, pincode }) {
  const [activeChartTab, setActiveChartTab] = useState('grid'); // 'grid' | 'volume' | 'rate' | 'time' | 'pending'

  if (loading && !recordData) {
    return (
      <div className="py-24 text-center space-y-3">
        <Loader2 size={32} className="animate-spin text-primary-600 mx-auto" />
        <p className="text-xs font-bold text-secondary-600">Retrieving 2022–2026 history from PostgreSQL...</p>
      </div>
    );
  }

  if (error || !recordData) {
    return (
      <div className="p-8 bg-red-50 border border-red-200 rounded-2xl text-center space-y-3 max-w-md mx-auto my-12">
        <AlertTriangle size={28} className="text-red-500 mx-auto" />
        <h3 className="text-sm font-bold text-red-900">Failed to Load Civic Record</h3>
        <p className="text-xs text-red-600">{error || 'Unable to retrieve historical years from database.'}</p>
        <Button size="sm" variant="outline" onClick={onRetry}>Retry</Button>
      </div>
    );
  }

  const { records = [], summary = {} } = recordData;

  return (
    <div className="space-y-6">
      {/* ── Section Title & Locality Info ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-secondary-900 tracking-tight">
            5-Year Municipal History (2022–2026)
          </h2>
          <p className="text-xs text-secondary-500 mt-0.5">
            Historical complaint totals, resolution rates, and SLA turnaround from PostgreSQL for <strong>{localityName} ({pincode})</strong>.
          </p>
        </div>

        <div className="text-xs font-bold text-primary-700 bg-primary-50 px-3 py-1.5 rounded-xl border border-primary-200">
          5 Consecutive Cycles Evaluated
        </div>
      </div>

      {/* ── 5-Year Aggregate Summary Strip ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <KpiCard
          label="5-Year Total Volume"
          value={summary.fiveYearTotal?.toLocaleString() || 0}
          sub="Complaints logged 2022–2026"
          icon={BarChart2}
          iconBg="bg-primary-50"
          iconColor="text-primary-600"
        />

        <KpiCard
          label="Average Resolution Rate"
          value={`${summary.fiveYearResolutionRate || 0}%`}
          sub="5-year closure proportion"
          icon={CheckCircle2}
          iconBg="bg-green-50"
          iconColor="text-success"
          valueColor="text-success"
        />

        <KpiCard
          label="Average Resolution Time"
          value={summary.fiveYearAvgResolutionLabel || 'N/A'}
          sub="Historical response SLA"
          icon={Clock}
          iconBg="bg-indigo-50"
          iconColor="text-indigo-600"
          valueColor="text-indigo-700"
        />

        <KpiCard
          label="Resolved vs Pending"
          value={`${summary.fiveYearResolved || 0} / ${summary.fiveYearPending || 0}`}
          sub="Resolved vs active backlog"
          icon={Layers}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
          valueColor="text-amber-700"
        />
      </div>

      {/* ── 4 Primary Interactive Charts ── */}
      <Card variant="flat" className="p-4 sm:p-6 border-secondary-200 bg-surface space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-secondary-100 pb-3">
          <div>
            <h3 className="text-sm font-extrabold text-secondary-900">
              Interactive Longitudinal Visualizations
            </h3>
            <p className="text-xs text-secondary-400">
              Annual performance metrics recorded across municipal cycles
            </p>
          </div>

          <div className="flex items-center gap-1 bg-secondary-100 p-1 rounded-xl text-xs overflow-x-auto">
            {[
              { id: 'grid', label: 'All Charts' },
              { id: 'volume', label: '1. Volume' },
              { id: 'rate', label: '2. Resolution Rate' },
              { id: 'time', label: '3. Resolution Time' },
              { id: 'pending', label: '4. Pending vs Resolved' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveChartTab(tab.id)}
                className={`px-3 py-1 rounded-lg font-bold transition-all whitespace-nowrap ${
                  activeChartTab === tab.id
                    ? 'bg-white text-primary-700 shadow-xs'
                    : 'text-secondary-600 hover:text-secondary-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Charts Container */}
        <div className={`grid gap-4 ${activeChartTab === 'grid' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
          {/* Chart 1: Volume */}
          {(activeChartTab === 'grid' || activeChartTab === 'volume') && (
            <div className="p-4 bg-secondary-50/60 rounded-2xl border border-secondary-200 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-secondary-800">1. Annual Complaint Volume Trend</span>
                <span className="text-primary-700 font-extrabold">2022–2026</span>
              </div>
              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={records}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="year" tickLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                    <Tooltip contentStyle={CUSTOM_TOOLTIP_STYLE} />
                    <Bar dataKey="total" name="Total Complaints" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Chart 2: Resolution Rate */}
          {(activeChartTab === 'grid' || activeChartTab === 'rate') && (
            <div className="p-4 bg-secondary-50/60 rounded-2xl border border-secondary-200 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-secondary-800">2. Resolution Rate Progression (%)</span>
                <span className="text-success font-extrabold">Target: 80%+</span>
              </div>
              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={records}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="year" tickLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} />
                    <YAxis domain={[0, 100]} tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                    <Tooltip contentStyle={CUSTOM_TOOLTIP_STYLE} />
                    <Line type="monotone" dataKey="resolutionRate" name="Resolution Rate (%)" stroke="#10B981" strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Chart 3: Turnaround Time */}
          {(activeChartTab === 'grid' || activeChartTab === 'time') && (
            <div className="p-4 bg-secondary-50/60 rounded-2xl border border-secondary-200 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-secondary-800">3. Average Resolution Time (Days)</span>
                <span className="text-indigo-700 font-extrabold">SLA Turnaround</span>
              </div>
              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={records}>
                    <defs>
                      <linearGradient id="colorTime" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="year" tickLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                    <Tooltip contentStyle={CUSTOM_TOOLTIP_STYLE} />
                    <Area type="monotone" dataKey="avgResolutionTimeDays" name="Avg Days to Resolve" stroke="#6366F1" fill="url(#colorTime)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Chart 4: Pending vs Resolved */}
          {(activeChartTab === 'grid' || activeChartTab === 'pending') && (
            <div className="p-4 bg-secondary-50/60 rounded-2xl border border-secondary-200 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-secondary-800">4. Pending vs Resolved Breakdown</span>
                <span className="text-amber-700 font-extrabold">Workflow Distribution</span>
              </div>
              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={records}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="year" tickLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                    <Tooltip contentStyle={CUSTOM_TOOLTIP_STYLE} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Bar dataKey="resolved" name="Resolved" fill="#10B981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="inProgress" name="In Progress" fill="#6366F1" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="pending" name="Pending" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* ── Annual Detailed Records Table ── */}
      <Card variant="flat" className="p-4 sm:p-5 border-secondary-200 bg-surface overflow-hidden">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-secondary-900 mb-3">
          Annual Breakdown Matrix (2022–2026)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-secondary-50 border-b border-secondary-200">
                <th className="px-3 py-2.5 text-left font-bold text-secondary-600">Year</th>
                <th className="px-3 py-2.5 text-right font-bold text-secondary-600">Total</th>
                <th className="px-3 py-2.5 text-right font-bold text-secondary-600">Resolved</th>
                <th className="px-3 py-2.5 text-right font-bold text-secondary-600">Pending</th>
                <th className="px-3 py-2.5 text-right font-bold text-secondary-600">In Progress</th>
                <th className="px-3 py-2.5 text-right font-bold text-secondary-600">Resolution Rate</th>
                <th className="px-3 py-2.5 text-right font-bold text-secondary-600">Avg Resolution</th>
                <th className="px-3 py-2.5 text-center font-bold text-secondary-600">Trend</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.year} className="border-b border-secondary-100 last:border-0 hover:bg-secondary-50/60">
                  <td className="px-3 py-2.5 font-bold text-secondary-900">Cycle {r.year}</td>
                  <td className="px-3 py-2.5 text-right font-bold text-secondary-900">{r.total}</td>
                  <td className="px-3 py-2.5 text-right text-success font-bold">{r.resolved}</td>
                  <td className="px-3 py-2.5 text-right text-amber-700 font-medium">{r.pending}</td>
                  <td className="px-3 py-2.5 text-right text-indigo-700 font-medium">{r.inProgress}</td>
                  <td className="px-3 py-2.5 text-right font-bold text-primary-700">{r.resolutionRate}%</td>
                  <td className="px-3 py-2.5 text-right font-medium text-secondary-700">{r.avgResolutionTimeLabel}</td>
                  <td className="px-3 py-2.5 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      r.outcomeTrend === 'improving' ? 'bg-green-50 text-success border border-green-200' :
                      r.outcomeTrend === 'declining' ? 'bg-red-50 text-error border border-red-200' :
                      'bg-secondary-100 text-secondary-600'
                    }`}>
                      {r.outcomeTrend === 'improving' ? '↑ Improving' : r.outcomeTrend === 'declining' ? '↓ Declining' : '→ Stable'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── 3. Services Tab Component (Roads, Garbage, Water, Drainage, Street Lighting)
// ═══════════════════════════════════════════════════════════════════════════════

function ServicesSection({ servicesData, loading, error, onRetry, localityName, pincode }) {
  if (loading && !servicesData) {
    return (
      <div className="py-24 text-center space-y-3">
        <Loader2 size={32} className="animate-spin text-primary-600 mx-auto" />
        <p className="text-xs font-bold text-secondary-600">Calculating service metrics from PostgreSQL...</p>
      </div>
    );
  }

  if (error || !servicesData) {
    return (
      <div className="p-8 bg-red-50 border border-red-200 rounded-2xl text-center space-y-3 max-w-md mx-auto my-12">
        <AlertTriangle size={28} className="text-red-500 mx-auto" />
        <h3 className="text-sm font-bold text-red-900">Failed to Load Services Data</h3>
        <p className="text-xs text-red-600">{error || 'Unable to retrieve department analytics from database.'}</p>
        <Button size="sm" variant="outline" onClick={onRetry}>Retry</Button>
      </div>
    );
  }

  const services = servicesData.services || [];

  // Key highlights
  const mostReported = [...services].sort((a, b) => b.complaintCount - a.complaintCount)[0] || {};
  const highestResolution = [...services].sort((a, b) => b.resolutionRate - a.resolutionRate)[0] || {};
  const largestPending = [...services].sort((a, b) => b.pending - a.pending)[0] || {};

  return (
    <div className="space-y-6">
      {/* ── Section Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-secondary-900 tracking-tight">
            Municipal Services Performance
          </h2>
          <p className="text-xs text-secondary-500 mt-0.5">
            Operational turnaround across the 5 core infrastructure agencies for <strong>{localityName} ({pincode})</strong>.
          </p>
        </div>

        <div className="text-xs font-bold text-primary-700 bg-primary-50 px-3 py-1.5 rounded-xl border border-primary-200">
          5 Core Municipal Services Tracked
        </div>
      </div>

      {/* ── 3 Key Highlights Strip ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Highlight 1: Most Reported */}
        <div className="p-4 bg-surface rounded-2xl border border-secondary-200 shadow-xs flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-secondary-400 block">
              Most Reported Service
            </span>
            <p className="text-sm font-black text-secondary-900 mt-0.5 flex items-center gap-1.5">
              <span>{mostReported.emoji}</span>
              <span>{mostReported.serviceName}</span>
            </p>
            <p className="text-[11px] text-secondary-500 mt-0.5">
              <strong>{mostReported.complaintCount}</strong> complaints recorded
            </p>
          </div>
          <span className="text-xs font-black text-primary-700 bg-primary-50 px-2 py-1 rounded-lg border border-primary-200">
            Top Volume
          </span>
        </div>

        {/* Highlight 2: Highest Resolution */}
        <div className="p-4 bg-surface rounded-2xl border border-secondary-200 shadow-xs flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-secondary-400 block">
              Highest Resolution Rate
            </span>
            <p className="text-sm font-black text-success mt-0.5 flex items-center gap-1.5">
              <span>{highestResolution.emoji}</span>
              <span>{highestResolution.serviceName}</span>
            </p>
            <p className="text-[11px] text-secondary-500 mt-0.5">
              <strong>{highestResolution.resolutionRate}%</strong> successfully closed
            </p>
          </div>
          <span className="text-xs font-black text-success bg-green-50 px-2 py-1 rounded-lg border border-green-200">
            Best SLA
          </span>
        </div>

        {/* Highlight 3: Largest Backlog */}
        <div className="p-4 bg-surface rounded-2xl border border-secondary-200 shadow-xs flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-secondary-400 block">
              Active Pending Backlog
            </span>
            <p className="text-sm font-black text-amber-700 mt-0.5 flex items-center gap-1.5">
              <span>{largestPending.emoji}</span>
              <span>{largestPending.serviceName}</span>
            </p>
            <p className="text-[11px] text-secondary-500 mt-0.5">
              <strong>{largestPending.pending}</strong> cases awaiting field crews
            </p>
          </div>
          <span className="text-xs font-black text-amber-700 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">
            Field Dispatch
          </span>
        </div>
      </div>

      {/* ── 5 Mandated Services Detailed Performance Cards ── */}
      <div className="space-y-4">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-secondary-600">
          Individual Service Operational Indices
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((srv) => (
            <Card key={srv.serviceKey} variant="flat" className="p-5 border-secondary-200 bg-surface flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{srv.emoji}</span>
                    <div>
                      <h4 className="text-sm font-black text-secondary-900">{srv.serviceName}</h4>
                      <p className="text-[10px] text-secondary-400 font-medium truncate max-w-[170px]" title={srv.department}>
                        {srv.department}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-primary-700 bg-primary-50 px-2.5 py-1 rounded-full border border-primary-200">
                    {srv.serviceScore}/100
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
                  <div className="bg-secondary-50 p-2 rounded-xl border border-secondary-100">
                    <span className="text-[10px] text-secondary-400 font-bold uppercase block">Total</span>
                    <strong className="text-secondary-900 font-black">{srv.complaintCount}</strong>
                  </div>
                  <div className="bg-green-50/60 p-2 rounded-xl border border-green-100">
                    <span className="text-[10px] text-success font-bold uppercase block">Resolved</span>
                    <strong className="text-success font-black">{srv.resolved}</strong>
                  </div>
                  <div className="bg-amber-50/60 p-2 rounded-xl border border-amber-100">
                    <span className="text-[10px] text-amber-700 font-bold uppercase block">Pending</span>
                    <strong className="text-amber-700 font-black">{srv.pending}</strong>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-1 border-t border-secondary-100">
                <ResolutionRateBar rate={srv.resolutionRate} label="Resolution Rate" />
                <div className="flex items-center justify-between text-xs text-secondary-600 font-medium">
                  <span>Avg Resolution Turnaround:</span>
                  <strong className="text-secondary-900 font-bold">{srv.averageResolutionTime}</strong>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* ── Services Comparison Table ── */}
      <Card variant="flat" className="p-4 sm:p-5 border-secondary-200 bg-surface overflow-hidden">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-secondary-900 mb-3">
          Cross-Department SLA Comparison Matrix
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-secondary-50 border-b border-secondary-200">
                <th className="px-3 py-2.5 text-left font-bold text-secondary-600">Service</th>
                <th className="px-3 py-2.5 text-left font-bold text-secondary-600">Department</th>
                <th className="px-3 py-2.5 text-right font-bold text-secondary-600">Total Count</th>
                <th className="px-3 py-2.5 text-right font-bold text-secondary-600">Resolved</th>
                <th className="px-3 py-2.5 text-right font-bold text-secondary-600">Pending</th>
                <th className="px-3 py-2.5 text-right font-bold text-secondary-600">Resolution Rate</th>
                <th className="px-3 py-2.5 text-right font-bold text-secondary-600">Avg Resolution</th>
                <th className="px-3 py-2.5 text-right font-bold text-secondary-600">Index Score</th>
              </tr>
            </thead>
            <tbody>
              {services.map((srv) => (
                <tr key={srv.serviceKey} className="border-b border-secondary-100 last:border-0 hover:bg-secondary-50/60">
                  <td className="px-3 py-2.5 font-bold text-secondary-900 flex items-center gap-2">
                    <span>{srv.emoji}</span>
                    <span>{srv.serviceName}</span>
                  </td>
                  <td className="px-3 py-2.5 text-secondary-600 font-medium truncate max-w-[200px]" title={srv.department}>
                    {srv.department}
                  </td>
                  <td className="px-3 py-2.5 text-right font-bold text-secondary-900">{srv.complaintCount}</td>
                  <td className="px-3 py-2.5 text-right font-bold text-success">{srv.resolved}</td>
                  <td className="px-3 py-2.5 text-right font-bold text-amber-700">{srv.pending}</td>
                  <td className="px-3 py-2.5 text-right font-black text-primary-700">{srv.resolutionRate}%</td>
                  <td className="px-3 py-2.5 text-right font-medium text-secondary-700">{srv.averageResolutionTime}</td>
                  <td className="px-3 py-2.5 text-right font-black text-secondary-900">{srv.serviceScore}/100</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── Main Civic Insights Page Component
// ═══════════════════════════════════════════════════════════════════════════════

export default function CivicInsights() {
  const location = useLocation();

  const [selectedPincode, setSelectedPincode] = useState(() => {
    return localStorage.getItem('civic_insights_pincode') || '400064';
  });

  const [customInput, setCustomInput] = useState('');
  const [inputError, setInputError] = useState('');

  // Server state
  const [overviewData, setOverviewData] = useState(null);
  const [recordData, setRecordData] = useState(null);
  const [servicesData, setServicesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Determine current active subroute (Only 3 kept: /insights, /insights/record, /insights/services)
  const isRecordRoute = location.pathname.startsWith('/insights/record');
  const isServicesRoute = location.pathname.startsWith('/insights/services');
  const isOverviewRoute = !isRecordRoute && !isServicesRoute;

  // Fetch backend data according to active subroute
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const pinParam = selectedPincode !== 'all' ? selectedPincode : undefined;

      if (isRecordRoute) {
        const data = await ApiClient.getCivicRecord({ pincode: pinParam });
        setRecordData(data);
      } else if (isServicesRoute) {
        const data = await ApiClient.getCivicServices({ pincode: pinParam });
        setServicesData(data);
      } else {
        const data = await ApiClient.getInsightsOverview({ pincode: pinParam });
        setOverviewData(data);
      }
    } catch (err) {
      console.error('Failed to load civic insights:', err);
      setError(err.message || 'Error communicating with database.');
    } finally {
      setLoading(false);
    }
  }, [selectedPincode, isRecordRoute, isServicesRoute]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePincodeChange = (newPincode) => {
    if (newPincode === selectedPincode) return;
    setSelectedPincode(newPincode);
    localStorage.setItem('civic_insights_pincode', newPincode);
    setInputError('');
    setCustomInput('');
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    const val = customInput.trim();
    if (!/^\d{6}$/.test(val)) {
      setInputError('Please enter a valid 6-digit postal pincode.');
      return;
    }
    handlePincodeChange(val);
  };

  const localityInfo = useMemo(() => {
    const found = SELECTABLE_LOCALITIES.find(l => l.code === selectedPincode);
    if (found) return found;
    return {
      code: selectedPincode,
      name: `Pincode ${selectedPincode}`,
      ward: `Municipal Zone (${selectedPincode})`,
      city: 'Custom Zone',
    };
  }, [selectedPincode]);

  return (
    <div className="animate-fade-in pb-16 space-y-6">
      {/* ── Page Header & Locality Selector ─────────────────────────────────── */}
      <section className="pt-2 pb-4 border-b border-secondary-200">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-primary-600 text-white flex items-center justify-center">
              <BarChart2 size={14} />
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary-700">
              Live Database Analytics
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            icon={RefreshCw}
            onClick={fetchData}
            loading={loading}
            className="text-xs font-bold text-secondary-600 hover:text-primary-600"
          >
            Refresh
          </Button>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-secondary-900 tracking-tight">
          Civic Insights
        </h1>
        <p className="text-xs sm:text-sm font-semibold text-secondary-500 mt-0.5">
          Real-time municipal performance, historical records, and departmental SLA analytics
        </p>

        {/* Locality Pills & Custom Pincode Input */}
        <div className="mt-4 space-y-3">
          <div className="flex flex-wrap gap-2">
            {SELECTABLE_LOCALITIES.map((loc) => {
              const isSelected = loc.code === selectedPincode;
              return (
                <button
                  key={loc.code}
                  onClick={() => handlePincodeChange(loc.code)}
                  id={`pincode-pill-${loc.code}`}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs ${
                    isSelected
                      ? 'bg-primary-600 text-white shadow-sm ring-2 ring-primary-300'
                      : 'bg-surface border border-secondary-200 text-secondary-700 hover:border-primary-400 hover:text-primary-700'
                  }`}
                >
                  <MapPin size={12} className={isSelected ? 'text-white' : 'text-primary-600'} />
                  <span>{loc.code === 'all' ? 'All Wards' : loc.code}</span>
                  <span className={`text-[10px] font-normal ${isSelected ? 'text-primary-100' : 'text-secondary-400'}`}>
                    ({loc.name})
                  </span>
                </button>
              );
            })}
          </div>

          <form onSubmit={handleCustomSubmit} className="flex items-center gap-2 max-w-sm">
            <div className="relative flex-1">
              <input
                id="custom-pincode-input"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="Or enter any 6-digit postal PIN"
                value={customInput}
                onChange={(e) => { setCustomInput(e.target.value); setInputError(''); }}
                className="input py-1.5 text-xs font-medium pl-8"
              />
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-secondary-400" />
            </div>
            <Button variant="ghost" size="sm" type="submit" id="custom-pincode-btn">
              Apply
            </Button>
          </form>

          {inputError && (
            <p className="text-xs text-error font-medium">{inputError}</p>
          )}

          <div className="p-3 bg-primary-50 rounded-xl border border-primary-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-secondary-600">Active Sector:</span>
              <strong className="text-secondary-900 font-bold">{localityInfo.name} ({selectedPincode})</strong>
            </div>
            <span className="text-[11px] text-primary-700 font-semibold hidden sm:inline">
              {localityInfo.ward}
            </span>
          </div>
        </div>

        {/* ── Sub-Navigation Bar (ONLY: Overview · Civic Record · Services) ── */}
        <nav aria-label="Civic Insights Sub-Navigation" className="mt-4">
          <div className="flex items-center gap-1.5 p-1 bg-secondary-100/90 rounded-2xl border border-secondary-200 overflow-x-auto no-scrollbar">
            <NavLink
              to="/insights"
              end
              id="insights-nav-overview"
              className={({ isActive }) =>
                `flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex-1 sm:flex-initial no-underline ${
                  isActive
                    ? 'bg-surface text-primary-700 shadow-sm ring-1 ring-secondary-200'
                    : 'text-secondary-600 hover:text-secondary-900 hover:bg-surface/60'
                }`
              }
            >
              <Activity size={14} className="flex-shrink-0" />
              <span>Overview</span>
            </NavLink>

            <NavLink
              to="/insights/record"
              id="insights-nav-record"
              className={({ isActive }) =>
                `flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex-1 sm:flex-initial no-underline ${
                  isActive
                    ? 'bg-surface text-primary-700 shadow-sm ring-1 ring-secondary-200'
                    : 'text-secondary-600 hover:text-secondary-900 hover:bg-surface/60'
                }`
              }
            >
              <Clock size={14} className="flex-shrink-0" />
              <span>Civic Record</span>
            </NavLink>

            <NavLink
              to="/insights/services"
              id="insights-nav-services"
              className={({ isActive }) =>
                `flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex-1 sm:flex-initial no-underline ${
                  isActive
                    ? 'bg-surface text-primary-700 shadow-sm ring-1 ring-secondary-200'
                    : 'text-secondary-600 hover:text-secondary-900 hover:bg-surface/60'
                }`
              }
            >
              <Layers size={14} className="flex-shrink-0" />
              <span>Services</span>
            </NavLink>
          </div>
        </nav>
      </section>

      {/* ── Sub-route Page Content ── */}
      <div>
        {isOverviewRoute && (
          <OverviewSection
            overview={overviewData}
            loading={loading}
            error={error}
            onRetry={fetchData}
            localityName={localityInfo.name}
            pincode={selectedPincode}
          />
        )}

        {isRecordRoute && (
          <CivicRecordSection
            recordData={recordData}
            loading={loading}
            error={error}
            onRetry={fetchData}
            localityName={localityInfo.name}
            pincode={selectedPincode}
          />
        )}

        {isServicesRoute && (
          <ServicesSection
            servicesData={servicesData}
            loading={loading}
            error={error}
            onRetry={fetchData}
            localityName={localityInfo.name}
            pincode={selectedPincode}
          />
        )}
      </div>
    </div>
  );
}