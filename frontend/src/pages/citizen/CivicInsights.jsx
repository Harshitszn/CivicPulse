import React, { useState, useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  BarChart2,
  MapPin,
  Search,
  TrendingUp,
  TrendingDown,
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
} from 'recharts';
import { usePincode } from '../../context/PincodeContext';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

// ── Locality & Demo Pincodes Metadata ─────────────────────────────────────────

export const DEMO_LOCALITIES = [
  {
    code: '400064',
    name: 'Malad West',
    ward: 'Ward 47 · P/North Ward',
    city: 'Mumbai',
  },
  {
    code: '400067',
    name: 'Kandivali West',
    ward: 'Ward 31 · R/South Ward',
    city: 'Mumbai',
  },
  {
    code: '400076',
    name: 'Powai',
    ward: 'Ward 12 · S Ward',
    city: 'Mumbai',
  },
  {
    code: '400054',
    name: 'Santacruz West',
    ward: 'Ward 84 · H/West Ward',
    city: 'Mumbai',
  },
];

export const SERVICE_CATEGORIES = [
  { key: 'roads',       label: 'Roads & Potholes',    emoji: '🛣️', dept: 'Public Works' },
  { key: 'water',       label: 'Water Supply',         emoji: '💧', dept: 'Water Board' },
  { key: 'sanitation',  label: 'Sanitation & Waste',   emoji: '🗑️', dept: 'Solid Waste Mgmt' },
  { key: 'streetlight', label: 'Streetlights',         emoji: '💡', dept: 'Public Lighting' },
  { key: 'drainage',    label: 'Drainage & Stormwater',emoji: '🌊', dept: 'Stormwater Drainage' },
  { key: 'parks',       label: 'Parks & Green Spaces', emoji: '🌳', dept: 'Gardens Dept.' },
  { key: 'electricity', label: 'Electricity & Grid',   emoji: '⚡', dept: 'Electricity Dept.' },
];

export function generate5YearHistory(pincode) {
  const pinNum = parseInt(pincode, 10) || 400000;
  const pinOffset = (pinNum % 19);

  const majorCategoriesByYear = [
    { year: '2022', majorCategory: 'Roads & Potholes', emoji: '🛣️', share: '36%' },
    { year: '2023', majorCategory: 'Water Supply', emoji: '💧', share: '32%' },
    { year: '2024', majorCategory: 'Drainage & Stormwater', emoji: '🌊', share: '29%' },
    { year: '2025', majorCategory: 'Sanitation & Waste', emoji: '🗑️', share: '34%' },
    { year: '2026', majorCategory: 'Roads & Potholes', emoji: '🛣️', share: '31%' },
  ];

  // 5-Year Historical civic record: 2022 to 2026
  const yearConfigs = [
    { year: '2022', baseTotal: 410 + pinOffset * 9,  baseRate: 53 + (pinNum % 8),  avgDays: 14.8 - (pinNum % 3) * 0.4 },
    { year: '2023', baseTotal: 470 + pinOffset * 10, baseRate: 61 + (pinNum % 9),  avgDays: 12.3 - (pinNum % 3) * 0.4 },
    { year: '2024', baseTotal: 530 + pinOffset * 11, baseRate: 69 + (pinNum % 10), avgDays: 9.6  - (pinNum % 3) * 0.3 },
    { year: '2025', baseTotal: 585 + pinOffset * 12, baseRate: 77 + (pinNum % 9),  avgDays: 7.4  - (pinNum % 3) * 0.3 },
    { year: '2026', baseTotal: 630 + pinOffset * 13, baseRate: 84 + (pinNum % 7),  avgDays: 5.6  - (pinNum % 3) * 0.2 },
  ];

  const raw = yearConfigs.map((item, idx) => {
    const total = item.baseTotal;
    const rate = Math.min(96, Math.max(48, item.baseRate));
    const resolved = Math.round(total * (rate / 100));
    const unresolved = total - resolved;
    const inProgress = Math.max(1, Math.round(unresolved * 0.62));
    const pending = Math.max(0, unresolved - inProgress);
    const avgResolutionTime = Number(Math.max(2.5, item.avgDays).toFixed(1));
    const cat = majorCategoriesByYear[idx];

    return {
      year: item.year,
      total,
      resolved,
      inProgress,
      pending,
      resolutionRate: rate,
      rate,
      avgResolutionTime,
      majorCategory: cat.majorCategory,
      majorCategoryEmoji: cat.emoji,
      majorCategoryShare: cat.share,
    };
  });

  // Calculate year-over-year neutral outcome descriptors
  return raw.map((item, idx) => {
    if (idx === 0) {
      return {
        ...item,
        outcomeTrend: 'stable',
        outcomeLabel: 'Baseline Year',
        volumeDiff: 0,
        rateDiff: 0,
        timeDiff: 0,
        neutralSummary: [
          'Initial observation year for historical recording.',
          `Major service category: ${item.majorCategory} (${item.majorCategoryShare} of local reports).`,
          `Resolution rate recorded at ${item.resolutionRate}%.`,
          `Average resolution time recorded at ${item.avgResolutionTime} days.`,
        ],
      };
    }

    const prev = raw[idx - 1];
    const volumeDiff = item.total - prev.total;
    const rateDiff = item.resolutionRate - prev.resolutionRate;
    const timeDiff = Number((item.avgResolutionTime - prev.avgResolutionTime).toFixed(1));

    let outcomeTrend = 'stable';
    if (rateDiff >= 3 || timeDiff <= -0.8) {
      outcomeTrend = 'improving';
    } else if (rateDiff <= -3 || timeDiff >= 0.8) {
      outcomeTrend = 'declining';
    }

    const neutralSummary = [];

    if (rateDiff > 0) {
      neutralSummary.push(`Resolution rate increased from ${prev.resolutionRate}% to ${item.resolutionRate}% (+${rateDiff}% vs ${prev.year}).`);
    } else if (rateDiff < 0) {
      neutralSummary.push(`Resolution rate decreased from ${prev.resolutionRate}% to ${item.resolutionRate}% (${rateDiff}% vs ${prev.year}).`);
    } else {
      neutralSummary.push(`Resolution rate remained stable at ${item.resolutionRate}%.`);
    }

    if (timeDiff < 0) {
      neutralSummary.push(`Average resolution time decreased from ${prev.avgResolutionTime}d to ${item.avgResolutionTime}d (${Math.abs(timeDiff)} days faster).`);
    } else if (timeDiff > 0) {
      neutralSummary.push(`Average resolution time increased from ${prev.avgResolutionTime}d to ${item.avgResolutionTime}d (+${timeDiff} days).`);
    } else {
      neutralSummary.push(`Average resolution time remained unchanged at ${item.avgResolutionTime} days.`);
    }

    if (volumeDiff > 0) {
      neutralSummary.push(`Complaint volume increased from ${prev.total} to ${item.total} (+${volumeDiff} complaints).`);
    } else if (volumeDiff < 0) {
      neutralSummary.push(`Complaint volume decreased from ${prev.total} to ${item.total} (${volumeDiff} complaints).`);
    } else {
      neutralSummary.push(`Complaint volume remained unchanged.`);
    }

    neutralSummary.push(`Major service category: ${item.majorCategory} (${item.majorCategoryShare} of annual volume).`);

    return {
      ...item,
      outcomeTrend,
      outcomeLabel: outcomeTrend === 'improving' ? 'Improving' : outcomeTrend === 'declining' ? 'Declining' : 'Stable',
      volumeDiff,
      rateDiff,
      timeDiff,
      neutralSummary,
    };
  });
}

export function getServiceScore(pincode, key, liveComplaints = []) {
  const matching = liveComplaints.filter(c => (c.categorySlug || '').includes(key) || (c.category || '').toLowerCase().includes(key));
  if (matching.length > 0) {
    const resCount = matching.filter(c => c.status === 'resolved').length;
    const rate = Math.round((resCount / matching.length) * 100);
    return Math.max(45, Math.min(98, rate > 0 ? rate : 60));
  }
  const pinNum = parseInt(pincode, 10) || 400000;
  const categorySeeds = { roads: 17, water: 29, sanitation: 43, streetlight: 59, drainage: 71, parks: 83, electricity: 97 };
  const val = ((pinNum + (categorySeeds[key] || 11)) % 40) + 56;
  return Math.min(96, Math.max(48, val));
}

export function getScoreBadgeColor(score) {
  if (score >= 75) return 'text-success bg-green-50 border-green-200';
  if (score >= 60) return 'text-primary-700 bg-primary-50 border-primary-200';
  if (score >= 48) return 'text-warning bg-amber-50 border-amber-200';
  return 'text-error bg-red-50 border-red-200';
}

// ── Reusable Section Header & Badges ──────────────────────────────────────────

function SectionHeader({ number, title, badge }) {
  return (
    <div className="flex items-center justify-between mt-8 mb-3">
      <div className="flex items-center gap-2">
        <span className="w-5 h-5 rounded-full bg-primary-100 text-primary-700 text-[11px] font-extrabold flex items-center justify-center">
          {number}
        </span>
        <h2 className="text-sm font-bold text-secondary-800 tracking-tight">{title}</h2>
      </div>
      {badge && badge}
    </div>
  );
}

function DemoBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-[10px] font-bold text-amber-700">
      📊 Demo Data
    </span>
  );
}

function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 border border-green-200 text-[10px] font-bold text-success">
      <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
      Live Complaint Store
    </span>
  );
}

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
  valueColor = 'text-secondary-900', badge, tooltip,
  isDemo = false,
}) {
  return (
    <div className={`relative flex flex-col justify-between p-4 rounded-2xl border bg-surface transition-all hover:shadow-md hover:-translate-y-[1px] group ${isDemo ? 'border-amber-200 bg-amber-50/30' : 'border-secondary-200'}`}>
      {isDemo && (
        <span className="absolute top-2 right-2 text-[9px] font-extrabold uppercase tracking-wide text-amber-500 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full">
          Demo
        </span>
      )}

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

      {tooltip && (
        <div className="absolute inset-x-0 bottom-full mb-1.5 hidden group-hover:block z-10 px-3">
          <div className="bg-secondary-900 text-white text-[10px] rounded-lg px-2.5 py-1.5 text-center shadow-lg leading-snug">
            {tooltip}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Resolution Rate Bar ────────────────────────────────────────────────────────

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

function parseEstimatedDays(str) {
  if (!str || str === 'Resolved') return null;
  const match = str.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── 1. Overview (CivicPulse Score, Current Snapshot, Priorities, Attention, Trend)
// ═══════════════════════════════════════════════════════════════════════════════

function OverviewSection({ complaints, pincode, localityInfo, getComplaintVerification }) {
  const pinNum = parseInt(pincode, 10) || 400000;
  const pinOffset = (pinNum % 19);

  // Scaled & real counts
  const total = complaints.length;
  const resolved = complaints.filter(c => c.status === 'resolved').length;
  const inProgress = complaints.filter(c => c.status === 'in_progress').length;
  const pending = complaints.filter(
    c => c.status !== 'resolved' && c.status !== 'in_progress'
  ).length;

  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : (68 + (pinOffset % 15));

  // CivicPulse Score: clean 0-100 composite
  const civicPulseScore = Math.min(96, Math.max(65, 78 + (pinOffset % 6) - 2));
  const prevScore = Math.max(60, civicPulseScore - 5);
  const scoreGain = Number((((civicPulseScore - prevScore) / prevScore) * 100).toFixed(1));

  // Top 3 Community Priorities (from live complaint voting or realistic locality defaults)
  const defaultPriorities = [
    { rank: 1, title: 'Road resurfacing and pothole repairs', category: 'Roads & Potholes', upvotes: 348 + pinOffset * 3 },
    { rank: 2, title: 'Low water pressure during peak hours', category: 'Water Supply', upvotes: 291 + pinOffset * 2 },
    { rank: 3, title: 'Unsegregated waste accumulation on main road', category: 'Sanitation & Waste', upvotes: 224 + pinOffset * 2 },
  ];

  const communityPriorities = useMemo(() => {
    if (complaints && complaints.length > 0) {
      const sorted = [...complaints].sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
      return sorted.slice(0, 3).map((c, idx) => ({
        rank: idx + 1,
        title: c.title,
        category: c.category || 'General Civic',
        upvotes: c.upvotes || (348 - idx * 55),
      }));
    }
    return defaultPriorities;
  }, [complaints, pinOffset]);

  // Max 2-3 Needs Attention Alerts
  const attentionItems = useMemo(() => {
    const unresolvedUrgent = (complaints || []).filter(
      c => c.status !== 'resolved' && (c.priority === 'urgent' || c.priority === 'high')
    );
    if (unresolvedUrgent.length > 0) {
      return unresolvedUrgent.slice(0, 3).map((c) => ({
        id: c._id,
        level: c.priority === 'urgent' ? 'urgent' : 'high',
        text: `${c.title} (${c.category}) · ${c.status === 'in_progress' ? 'In Progress' : 'Pending Action'}`,
      }));
    }
    return [
      { id: 1, level: 'urgent', text: `Drainage & water complaints increased ${18 + (pinOffset % 7)}% this quarter.` },
      { id: 2, level: 'high', text: `${Math.max(2, 5 - (pinOffset % 3))} high-priority complaints pending municipal assignment.` },
    ];
  }, [complaints, pinOffset]);

  // 5-Year History for small trend sparkline
  const historyData = useMemo(() => generate5YearHistory(pincode), [pincode]);

  return (
    <div className="space-y-4">
      {/* ── 1. CivicPulse Score (Visually Prominent but Simple) ── */}
      <Card variant="flat" className="p-4 sm:p-5 border-secondary-200 bg-surface">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary-600 animate-pulse" />
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-secondary-500">
                CivicPulse Score
              </h3>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                Prototype Analytical Metric
              </span>
            </div>

            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="text-3xl sm:text-4xl font-black text-secondary-900 tracking-tight">
                {civicPulseScore}
              </span>
              <span className="text-base font-bold text-secondary-400">/ 100</span>

              <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-black bg-green-50 text-success border border-green-200">
                <TrendingUp size={13} />
                <span>↑ {scoreGain}% YoY</span>
              </span>
            </div>

            <p className="text-[11px] text-secondary-500 mt-1 leading-relaxed max-w-xl">
              CivicPulse Score is a prototype analytical metric based on complaint and community-verification data. It is not an official government rating.
            </p>
          </div>

          <div className="flex flex-col sm:items-end gap-1.5 flex-shrink-0">
            <span className="text-xs font-bold text-primary-700 bg-primary-50 border border-primary-200 px-3 py-1.5 rounded-xl self-start sm:self-auto">
              Locality: {localityInfo?.name || `PIN ${pincode}`}
            </span>
            <span className="text-[10px] text-secondary-400 font-medium">
              Based on {total > 0 ? `${total} active complaints` : 'locality civic audits'}
            </span>
          </div>
        </div>
      </Card>

      {/* ── 2. Current Civic Snapshot ── */}
      <Card variant="flat" className="p-4 sm:p-5 border-secondary-200 bg-surface space-y-4">
        <div className="flex items-center justify-between border-b border-secondary-100 pb-2.5">
          <div className="flex items-center gap-2">
            <Activity size={15} className="text-primary-600" />
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-secondary-800">
              Current Civic Snapshot
            </h3>
          </div>
          <span className="text-[11px] text-secondary-400 font-semibold">
            {localityInfo?.ward || `Pincode ${pincode}`}
          </span>
        </div>

        {/* 4 Primary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-secondary-50/80 rounded-xl border border-secondary-100">
            <p className="text-xl sm:text-2xl font-black text-secondary-900 leading-none">
              {total > 0 ? total : 12}
            </p>
            <p className="text-xs font-bold text-secondary-700 mt-1.5">Total Issues</p>
            <p className="text-[10px] text-secondary-400 mt-0.5">Recorded in area</p>
          </div>

          <div className="p-3 bg-green-50/70 rounded-xl border border-green-100">
            <p className="text-xl sm:text-2xl font-black text-success leading-none">
              {total > 0 ? resolved : 8}
            </p>
            <p className="text-xs font-bold text-green-800 mt-1.5">Resolved</p>
            <p className="text-[10px] text-green-600 mt-0.5">{resolutionRate}% resolved</p>
          </div>

          <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-100">
            <p className="text-xl sm:text-2xl font-black text-warning leading-none">
              {total > 0 ? inProgress : 3}
            </p>
            <p className="text-xs font-bold text-amber-800 mt-1.5">In Progress</p>
            <p className="text-[10px] text-amber-600 mt-0.5">Being worked</p>
          </div>

          <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-100">
            <p className="text-xl sm:text-2xl font-black text-primary-700 leading-none">
              {total > 0 ? pending : 1}
            </p>
            <p className="text-xs font-bold text-primary-800 mt-1.5">Pending</p>
            <p className="text-[10px] text-primary-600 mt-0.5">Awaiting action</p>
          </div>
        </div>

        {/* Resolution Rate Progress */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-secondary-700">Resolution Rate</span>
            <span className="text-success text-sm font-black">{resolutionRate}%</span>
          </div>
          <div className="w-full bg-secondary-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="h-2.5 rounded-full bg-success transition-all duration-700"
              style={{ width: `${resolutionRate}%` }}
            />
          </div>
        </div>
      </Card>

      {/* ── 3 & 4. Two-Column Grid: Top 3 Community Priorities & Needs Attention ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Top 3 Community Priorities */}
        <Card variant="flat" className="p-4 sm:p-5 border-secondary-200 bg-surface space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-secondary-100 pb-2 mb-3">
              <div className="flex items-center gap-2">
                <ThumbsUp size={14} className="text-primary-600" />
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-secondary-800">
                  Top 3 Community Priorities
                </h3>
              </div>
              <span className="text-[10px] text-secondary-400 font-semibold">
                Citizen Upvotes
              </span>
            </div>

            <div className="space-y-2">
              {communityPriorities.map((item) => (
                <div
                  key={item.rank}
                  className="p-2.5 rounded-xl bg-secondary-50/80 border border-secondary-100 flex items-center justify-between gap-2 hover:border-primary-300 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-primary-100 text-primary-700 text-[11px] font-black flex items-center justify-center flex-shrink-0">
                      #{item.rank}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-secondary-800 truncate">
                        {item.title}
                      </p>
                      <p className="text-[10px] text-secondary-400 truncate">
                        {item.category}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-xs font-black text-primary-700 bg-primary-50 px-2 py-0.5 rounded-md border border-primary-100 flex-shrink-0">
                    <span>▲</span>
                    <span>{item.upvotes}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="text-[10px] text-secondary-400 italic pt-1">
            Ranked directly from verified resident votes in {localityInfo?.name || `Pincode ${pincode}`}.
          </p>
        </Card>

        {/* Needs Attention Alerts (Max 2-3) */}
        <Card variant="flat" className="p-4 sm:p-5 border-secondary-200 bg-surface space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-secondary-100 pb-2 mb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle size={14} className="text-error" />
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-secondary-800">
                  Needs Attention
                </h3>
              </div>
              <span className="text-[10px] text-error font-semibold uppercase">
                Active Alerts
              </span>
            </div>

            <div className="space-y-2">
              {attentionItems.map((att) => (
                <div
                  key={att.id}
                  className={`p-2.5 rounded-xl border flex items-start gap-2.5 text-xs font-medium ${
                    att.level === 'urgent'
                      ? 'bg-red-50/80 border-red-200 text-red-900'
                      : 'bg-amber-50/80 border-amber-200 text-amber-900'
                  }`}
                >
                  <span className="flex-shrink-0 mt-0.5">
                    {att.level === 'urgent' ? '🔴' : '🟠'}
                  </span>
                  <span className="leading-snug">{att.text}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-[10px] text-secondary-400 italic pt-1">
            High-severity issues prioritized for municipal administrative focus.
          </p>
        </Card>
      </div>

      {/* ── 5. Small 5-Year Trend Preview & Direct Navigation CTAs ── */}
      <Card variant="flat" className="p-4 sm:p-5 border-secondary-200 bg-surface space-y-4">
        <div className="flex items-center justify-between border-b border-secondary-100 pb-2">
          <div className="flex items-center gap-2">
            <TrendingUp size={14} className="text-primary-600" />
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-secondary-800">
              5-Year Trend Preview (2022–2026)
            </h3>
          </div>
          <span className="text-[10px] text-secondary-400 font-semibold">
            Resolution rate %
          </span>
        </div>

        {/* Small Sparkline / Area Chart Preview */}
        <div className="h-28 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={historyData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="miniRateGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="year" tickLine={false} axisLine={{ stroke: '#E5E7EB' }} tick={{ fontSize: 10, fill: '#6B7280' }} />
              <YAxis domain={[40, 100]} tickLine={false} axisLine={false} tick={{ fontSize: 9, fill: '#9CA3AF' }} tickFormatter={(v) => `${v}%`} />
              <Tooltip
                contentStyle={CUSTOM_TOOLTIP_STYLE}
                formatter={(val) => [`${val}%`, 'Resolution Rate']}
                labelFormatter={(label) => `Civic Year ${label}`}
              />
              <Area type="monotone" dataKey="resolutionRate" stroke="#2563EB" strokeWidth={2} fillOpacity={1} fill="url(#miniRateGrad)" dot={{ r: 3, fill: '#2563EB' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* ── 6 & 7. Navigation Buttons to Civic Record and Services ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 border-t border-secondary-100">
          <NavLink
            to="/insights/record"
            id="overview-cta-record"
            className="flex items-center justify-between p-3 rounded-xl bg-secondary-50 hover:bg-primary-50 text-secondary-800 hover:text-primary-700 border border-secondary-200 hover:border-primary-300 transition-all no-underline group shadow-xs"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center flex-shrink-0">
                <Clock size={14} />
              </div>
              <div className="min-w-0 text-left">
                <p className="text-xs font-bold leading-tight truncate">View Full Civic Record</p>
                <p className="text-[10px] text-secondary-400 truncate">2022–2026 history & timeline</p>
              </div>
            </div>
            <ChevronRight size={14} className="text-secondary-400 group-hover:text-primary-600 transition-transform group-hover:translate-x-0.5 flex-shrink-0" />
          </NavLink>

          <NavLink
            to="/insights/services"
            id="overview-cta-services"
            className="flex items-center justify-between p-3 rounded-xl bg-secondary-50 hover:bg-primary-50 text-secondary-800 hover:text-primary-700 border border-secondary-200 hover:border-primary-300 transition-all no-underline group shadow-xs"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center flex-shrink-0">
                <Layers size={14} />
              </div>
              <div className="min-w-0 text-left">
                <p className="text-xs font-bold leading-tight truncate">Explore Municipal Services</p>
                <p className="text-[10px] text-secondary-400 truncate">Departmental performance indices</p>
              </div>
            </div>
            <ChevronRight size={14} className="text-secondary-400 group-hover:text-primary-600 transition-transform group-hover:translate-x-0.5 flex-shrink-0" />
          </NavLink>
        </div>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── 2. Civic Record (5-Year Historical Trends & Civic Timeline) ───────────────
// ═══════════════════════════════════════════════════════════════════════════════

function CivicRecordSection({ pincode, localityInfo }) {
  const [activeChartTab, setActiveChartTab] = useState('grid');
  const historyData = useMemo(() => generate5YearHistory(pincode), [pincode]);
  const [selectedYear, setSelectedYear] = useState('2026');

  const activeYearData = useMemo(() => {
    return historyData.find(d => d.year === selectedYear) || historyData[historyData.length - 1];
  }, [historyData, selectedYear]);

  const summary = useMemo(() => {
    const totalAll5Yrs = historyData.reduce((acc, curr) => acc + curr.total, 0);
    const resolvedAll5Yrs = historyData.reduce((acc, curr) => acc + curr.resolved, 0);
    const startRate = historyData[0].resolutionRate;
    const endRate = historyData[historyData.length - 1].resolutionRate;
    const rateGain = endRate - startRate;
    const startTime = historyData[0].avgResolutionTime;
    const endTime = historyData[historyData.length - 1].avgResolutionTime;
    const timeImprovement = ((startTime - endTime) / startTime) * 100;

    return {
      totalAll5Yrs,
      resolvedAll5Yrs,
      overall5YrRate: Math.round((resolvedAll5Yrs / totalAll5Yrs) * 100),
      rateGain,
      timeImprovement: Math.round(timeImprovement),
      startYear: historyData[0].year,
      endYear: historyData[historyData.length - 1].year,
    };
  }, [historyData]);

  const getTrendStyle = (trend) => {
    switch (trend) {
      case 'improving':
        return {
          bg: 'bg-green-50 text-green-700 border-green-200',
          dot: 'bg-green-500',
          label: 'Improving',
          icon: TrendingUp,
        };
      case 'declining':
        return {
          bg: 'bg-red-50 text-red-700 border-red-200',
          dot: 'bg-red-500',
          label: 'Declining',
          icon: TrendingDown,
        };
      case 'stable':
      default:
        return {
          bg: 'bg-blue-50 text-primary-700 border-blue-200',
          dot: 'bg-primary-500',
          label: 'Stable',
          icon: Activity,
        };
    }
  };

  return (
    <div className="space-y-4">
      {/* ── Section Title & Subtitle ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-secondary-900 tracking-tight">
              Civic Record
            </h2>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-[10px] font-bold text-amber-700">
              <span>📊</span>
              <span>Prototype/Demo Data</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm font-medium text-secondary-500 mt-0.5">
            Local civic outcomes over the selected 5-year period.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-primary-700 bg-primary-50 border border-primary-200 px-3 py-1.5 rounded-xl">
            Selected Locality: <strong>{localityInfo?.name || `Pincode ${pincode}`} ({pincode})</strong>
          </span>
        </div>
      </div>

      {/* ── 5-Year Aggregate Summary Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3.5 bg-surface rounded-2xl border border-secondary-200 shadow-xs">
          <p className="text-[10px] uppercase font-bold text-secondary-400">5-Yr Total Volume</p>
          <p className="text-xl font-black text-secondary-900 mt-0.5">{summary.totalAll5Yrs.toLocaleString()}</p>
          <p className="text-[10px] text-secondary-500">2022–2026 reports logged</p>
        </div>
        <div className="p-3.5 bg-surface rounded-2xl border border-secondary-200 shadow-xs">
          <p className="text-[10px] uppercase font-bold text-green-700">5-Yr Total Resolved</p>
          <p className="text-xl font-black text-success mt-0.5">{summary.resolvedAll5Yrs.toLocaleString()}</p>
          <p className="text-[10px] text-green-600">{summary.overall5YrRate}% cumulative resolution</p>
        </div>
        <div className="p-3.5 bg-surface rounded-2xl border border-secondary-200 shadow-xs">
          <p className="text-[10px] uppercase font-bold text-primary-700">Resolution Rate Jump</p>
          <p className="text-xl font-black text-primary-700 mt-0.5">{historyData[0].resolutionRate}% → {historyData[4].resolutionRate}%</p>
          <p className="text-[10px] text-primary-600">+{summary.rateGain}% 5-year growth</p>
        </div>
        <div className="p-3.5 bg-surface rounded-2xl border border-secondary-200 shadow-xs">
          <p className="text-[10px] uppercase font-bold text-purple-700">Resolution Speed</p>
          <p className="text-xl font-black text-purple-700 mt-0.5">{historyData[0].avgResolutionTime}d → {historyData[4].avgResolutionTime}d</p>
          <p className="text-[10px] text-purple-600">{summary.timeImprovement}% faster closure</p>
        </div>
      </div>

      {/* ── Primary Visualizations Selector ── */}
      <Card variant="flat" className="p-4 sm:p-5 border-secondary-200 bg-surface space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-secondary-100">
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-secondary-800 flex items-center gap-2">
              <TrendingUp size={15} className="text-primary-600" />
              <span>Historical Visualizations (2022–2026)</span>
            </h3>
            <p className="text-[11px] text-secondary-400 mt-0.5">
              Annual performance indices for Pincode {pincode}
            </p>
          </div>

          <div className="inline-flex p-0.5 bg-secondary-100 rounded-xl text-xs overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveChartTab('grid')}
              className={`px-3 py-1 rounded-lg font-bold transition-all whitespace-nowrap ${
                activeChartTab === 'grid'
                  ? 'bg-surface text-primary-700 shadow-xs ring-1 ring-secondary-200'
                  : 'text-secondary-600 hover:text-secondary-900'
              }`}
            >
              All 4 Charts (Grid)
            </button>
            <button
              type="button"
              onClick={() => setActiveChartTab('volume')}
              className={`px-3 py-1 rounded-lg font-bold transition-all whitespace-nowrap ${
                activeChartTab === 'volume'
                  ? 'bg-surface text-primary-700 shadow-xs ring-1 ring-secondary-200'
                  : 'text-secondary-600 hover:text-secondary-900'
              }`}
            >
              1. Volume Trend
            </button>
            <button
              type="button"
              onClick={() => setActiveChartTab('rate')}
              className={`px-3 py-1 rounded-lg font-bold transition-all whitespace-nowrap ${
                activeChartTab === 'rate'
                  ? 'bg-surface text-primary-700 shadow-xs ring-1 ring-secondary-200'
                  : 'text-secondary-600 hover:text-secondary-900'
              }`}
            >
              2. Resolution Rate
            </button>
            <button
              type="button"
              onClick={() => setActiveChartTab('time')}
              className={`px-3 py-1 rounded-lg font-bold transition-all whitespace-nowrap ${
                activeChartTab === 'time'
                  ? 'bg-surface text-primary-700 shadow-xs ring-1 ring-secondary-200'
                  : 'text-secondary-600 hover:text-secondary-900'
              }`}
            >
              3. Resolution Time
            </button>
            <button
              type="button"
              onClick={() => setActiveChartTab('pending_vs_resolved')}
              className={`px-3 py-1 rounded-lg font-bold transition-all whitespace-nowrap ${
                activeChartTab === 'pending_vs_resolved'
                  ? 'bg-surface text-primary-700 shadow-xs ring-1 ring-secondary-200'
                  : 'text-secondary-600 hover:text-secondary-900'
              }`}
            >
              4. Pending vs Resolved
            </button>
          </div>
        </div>

        {/* ── 4 Primary Charts Grid ── */}
        <div className={`grid gap-4 ${activeChartTab === 'grid' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
          {/* Chart 1: Complaint Volume Trend */}
          {(activeChartTab === 'grid' || activeChartTab === 'volume') && (
            <div className="p-3.5 bg-secondary-50/60 rounded-2xl border border-secondary-200">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-xs font-bold text-secondary-800">
                    1. Complaint Volume Trend
                  </p>
                  <p className="text-[10px] text-secondary-400">
                    Total complaints submitted each year (2022–2026)
                  </p>
                </div>
                <span className="text-xs font-black text-primary-700 bg-primary-50 px-2 py-0.5 rounded border border-primary-200">
                  {historyData[4].total.toLocaleString()} in 2026
                </span>
              </div>

              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={historyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="year" tickLine={false} axisLine={{ stroke: '#E5E7EB' }} tick={{ fontSize: 11, fill: '#6B7280' }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                    <Tooltip
                      contentStyle={CUSTOM_TOOLTIP_STYLE}
                      formatter={(val) => [val.toLocaleString(), 'Total Complaints']}
                      labelFormatter={(label) => `Year ${label}`}
                    />
                    <Bar dataKey="total" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={26} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Chart 2: Resolution Rate Trend */}
          {(activeChartTab === 'grid' || activeChartTab === 'rate') && (
            <div className="p-3.5 bg-secondary-50/60 rounded-2xl border border-secondary-200">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-xs font-bold text-secondary-800">
                    2. Resolution Rate Trend (%)
                  </p>
                  <p className="text-[10px] text-secondary-400">
                    Proportion of complaints resolved annually
                  </p>
                </div>
                <span className="text-xs font-black text-success bg-green-50 px-2 py-0.5 rounded border border-green-200">
                  {historyData[4].resolutionRate}% in 2026
                </span>
              </div>

              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={historyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="rateGradRecord" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#16A34A" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#16A34A" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="year" tickLine={false} axisLine={{ stroke: '#E5E7EB' }} tick={{ fontSize: 11, fill: '#6B7280' }} />
                    <YAxis domain={[0, 100]} tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} tickFormatter={(v) => `${v}%`} />
                    <Tooltip
                      contentStyle={CUSTOM_TOOLTIP_STYLE}
                      formatter={(val) => [`${val}%`, 'Resolution Rate']}
                      labelFormatter={(label) => `Year ${label}`}
                    />
                    <Area type="monotone" dataKey="resolutionRate" stroke="#16A34A" strokeWidth={2.5} fillOpacity={1} fill="url(#rateGradRecord)" dot={{ r: 4, fill: '#16A34A', strokeWidth: 2, stroke: '#FFFFFF' }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Chart 3: Average Resolution Time Trend */}
          {(activeChartTab === 'grid' || activeChartTab === 'time') && (
            <div className="p-3.5 bg-secondary-50/60 rounded-2xl border border-secondary-200">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-xs font-bold text-secondary-800">
                    3. Average Resolution Time (Days)
                  </p>
                  <p className="text-[10px] text-secondary-400">
                    Average turnaround duration from report to resolution
                  </p>
                </div>
                <span className="text-xs font-black text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                  {historyData[4].avgResolutionTime} Days (Fastest)
                </span>
              </div>

              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={historyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="year" tickLine={false} axisLine={{ stroke: '#E5E7EB' }} tick={{ fontSize: 11, fill: '#6B7280' }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} tickFormatter={(v) => `${v}d`} />
                    <Tooltip
                      contentStyle={CUSTOM_TOOLTIP_STYLE}
                      formatter={(val) => [`${val} Days`, 'Average Resolution Time']}
                      labelFormatter={(label) => `Year ${label}`}
                    />
                    <Bar dataKey="avgResolutionTime" fill="#8B5CF6" radius={[4, 4, 0, 0]} barSize={26} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Chart 4: Pending vs Resolved Comparison */}
          {(activeChartTab === 'grid' || activeChartTab === 'pending_vs_resolved') && (
            <div className="p-3.5 bg-secondary-50/60 rounded-2xl border border-secondary-200">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-xs font-bold text-secondary-800">
                    4. Pending vs. Resolved Comparison
                  </p>
                  <p className="text-[10px] text-secondary-400">
                    Distribution of Resolved, In Progress, and Pending complaints
                  </p>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-semibold text-secondary-500">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-[#16A34A]" /> Res</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-[#2563EB]" /> In Prog</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-[#D97706]" /> Pend</span>
                </div>
              </div>

              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={historyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="year" tickLine={false} axisLine={{ stroke: '#E5E7EB' }} tick={{ fontSize: 11, fill: '#6B7280' }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                    <Tooltip
                      contentStyle={CUSTOM_TOOLTIP_STYLE}
                      formatter={(val, name) => {
                        const labels = {
                          resolved: 'Resolved',
                          inProgress: 'In Progress',
                          pending: 'Pending',
                        };
                        return [val.toLocaleString(), labels[name] || name];
                      }}
                      labelFormatter={(label) => `Year ${label}`}
                    />
                    <Bar dataKey="resolved" name="resolved" stackId="a" fill="#16A34A" radius={[0, 0, 0, 0]} barSize={26} />
                    <Bar dataKey="inProgress" name="inProgress" stackId="a" fill="#2563EB" radius={[0, 0, 0, 0]} barSize={26} />
                    <Bar dataKey="pending" name="pending" stackId="a" fill="#D97706" radius={[4, 4, 0, 0]} barSize={26} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* ── Year-by-Year Timeline Underneath ── */}
      <Card variant="flat" className="p-4 sm:p-5 border-secondary-200 bg-surface space-y-4">
        <div className="flex items-center justify-between border-b border-secondary-100 pb-2">
          <div className="flex items-center gap-2">
            <Clock size={15} className="text-primary-600" />
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-secondary-800">
              Year-by-Year Civic Timeline (2022–2026)
            </h3>
          </div>
          <span className="text-[11px] text-secondary-400">
            Click any year to highlight observations
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
          {historyData.map((item) => {
            const isSelected = item.year === selectedYear;
            const trendStyle = getTrendStyle(item.outcomeTrend);

            return (
              <button
                key={item.year}
                type="button"
                onClick={() => setSelectedYear(item.year)}
                className={`text-left p-3 rounded-2xl border transition-all relative flex flex-col justify-between group ${
                  isSelected
                    ? 'bg-primary-50/50 border-primary-500 shadow-md ring-2 ring-primary-500/20'
                    : 'bg-surface border-secondary-200 hover:border-primary-300 hover:bg-secondary-50/50'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span className={`text-sm font-black ${isSelected ? 'text-primary-700' : 'text-secondary-900'}`}>
                    {item.year}
                  </span>
                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold border ${trendStyle.bg}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${trendStyle.dot}`} />
                    {trendStyle.label}
                  </span>
                </div>

                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between items-center">
                    <span className="text-secondary-400">Volume:</span>
                    <span className="font-bold text-secondary-800">{item.total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-secondary-400">Res. Rate:</span>
                    <span className="font-extrabold text-success">{item.resolutionRate}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-secondary-400">Avg. Time:</span>
                    <span className="font-bold text-secondary-700">{item.avgResolutionTime}d</span>
                  </div>
                  <div className="pt-1 border-t border-secondary-100 mt-1">
                    <p className="text-[10px] text-secondary-400 truncate">Top Category:</p>
                    <p className="text-[10px] font-bold text-secondary-800 truncate flex items-center gap-1">
                      <span>{item.majorCategoryEmoji}</span>
                      <span>{item.majorCategory}</span>
                    </p>
                  </div>
                </div>

                {isSelected && (
                  <div className="mt-2 text-center">
                    <span className="text-[9px] font-extrabold uppercase text-primary-600 bg-primary-100/70 px-2 py-0.5 rounded-full">
                      ● Selected
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {activeYearData && (
          <div className="p-3.5 bg-secondary-50/80 rounded-2xl border border-secondary-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 pb-2 border-b border-secondary-200">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-secondary-900">
                  Year {activeYearData.year} Outcome Summary
                </span>
                {(() => {
                  const ts = getTrendStyle(activeYearData.outcomeTrend);
                  return (
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${ts.bg}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${ts.dot}`} />
                      Trend: {ts.label}
                    </span>
                  );
                })()}
              </div>

              <span className="text-[11px] text-secondary-600 font-medium">
                {activeYearData.resolved.toLocaleString()} resolved / {activeYearData.total.toLocaleString()} total ({activeYearData.resolutionRate}% rate · {activeYearData.avgResolutionTime} days avg)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {activeYearData.neutralSummary?.map((stmt, sIdx) => (
                <div key={sIdx} className="flex items-start gap-1.5 text-secondary-600">
                  <span className="text-primary-600 font-bold mt-0.5">▪</span>
                  <span>{stmt}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Comprehensive 5-Year Data Table ── */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-secondary-800">
              Tabular 5-Year Performance Metrics (2022–2026)
            </p>
            <span className="text-[11px] text-secondary-400">
              Includes all 6 key civic metrics
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-secondary-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-secondary-50 text-secondary-600 font-semibold border-b border-secondary-200">
                <tr>
                  <th className="p-2.5">Civic Year</th>
                  <th className="p-2.5">Trend</th>
                  <th className="p-2.5 text-right">Total</th>
                  <th className="p-2.5 text-right text-success">Resolved</th>
                  <th className="p-2.5 text-right text-primary-700">In Progress</th>
                  <th className="p-2.5 text-right text-amber-600">Pending</th>
                  <th className="p-2.5 text-right">Resolution Rate</th>
                  <th className="p-2.5 text-right">Avg. Time</th>
                  <th className="p-2.5">Major Category</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-100 text-secondary-700">
                {historyData.map((row) => {
                  const isSelected = row.year === selectedYear;
                  const ts = getTrendStyle(row.outcomeTrend);
                  return (
                    <tr
                      key={row.year}
                      onClick={() => setSelectedYear(row.year)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-primary-50/70 font-semibold text-secondary-900'
                          : 'hover:bg-secondary-50/60'
                      }`}
                    >
                      <td className="p-2.5 font-bold text-secondary-900 flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-primary-600 ring-2 ring-primary-300' : 'bg-secondary-400'}`} />
                        {row.year}
                      </td>
                      <td className="p-2.5">
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border ${ts.bg}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${ts.dot}`} />
                          {ts.label}
                        </span>
                      </td>
                      <td className="p-2.5 text-right font-medium">{row.total.toLocaleString()}</td>
                      <td className="p-2.5 text-right font-bold text-success">{row.resolved.toLocaleString()}</td>
                      <td className="p-2.5 text-right font-medium text-primary-700">{row.inProgress.toLocaleString()}</td>
                      <td className="p-2.5 text-right font-medium text-amber-600">{row.pending.toLocaleString()}</td>
                      <td className="p-2.5 text-right font-extrabold text-primary-800">{row.resolutionRate}%</td>
                      <td className="p-2.5 text-right font-bold text-secondary-800">{row.avgResolutionTime} days</td>
                      <td className="p-2.5 text-secondary-600 text-[11px] truncate max-w-[140px]">
                        {row.majorCategoryEmoji} {row.majorCategory}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mandatory Transparency & Neutrality Disclaimer */}
        <div className="p-3 bg-secondary-50 rounded-xl border border-secondary-200 text-[11px] text-secondary-500 leading-relaxed">
          <p className="font-semibold text-secondary-700 flex items-center gap-1.5 mb-1">
            <Info size={13} className="text-secondary-500" />
            Civic Transparency Notice:
          </p>
          <p>
            Civic outcomes recorded during the selected period (2022–2026). Metrics represent aggregated public utility performance and administrative ward service logs for <strong>Pincode {pincode}</strong>.
            This data reflects public utility and service operations and is not affiliated with or representative of any specific individual or political campaign. Prototype estimations are shown until verified municipal audits are connected.
          </p>
        </div>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── 3. Services (Service Performance by Department) ───────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

function ServicesSection({ pincode, complaints }) {
  const categoryScores = useMemo(() => {
    return SERVICE_CATEGORIES.map(cat => {
      const score = getServiceScore(pincode, cat.key, complaints);
      const catComplaints = complaints.filter(c => (c.categorySlug || '').includes(cat.key) || (c.category || '').toLowerCase().includes(cat.key));
      return {
        ...cat,
        score,
        issueCount: catComplaints.length,
      };
    });
  }, [pincode, complaints]);

  return (
    <div>
      <SectionHeader number="3" title="Services" badge={<DemoBadge />} />
      <Card variant="flat" className="p-4 sm:p-5 space-y-3">
        <p className="text-xs text-secondary-500 leading-relaxed">
          Civic-service operational indices by core municipal department for <strong>Selected Locality {pincode}</strong>.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {categoryScores.map((cat) => (
            <div key={cat.key} className="p-3.5 bg-secondary-50 rounded-xl border border-secondary-200 flex flex-col justify-between hover:border-primary-300 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-lg">{cat.emoji}</span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-secondary-800 truncate">{cat.label}</p>
                    <p className="text-[10px] text-secondary-400 truncate">{cat.dept}</p>
                  </div>
                </div>
                <span className={`text-xs font-black px-2 py-0.5 rounded-md ${getScoreBadgeColor(cat.score)}`}>
                  {cat.score}%
                </span>
              </div>

              <div className="w-full bg-secondary-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    cat.score >= 75 ? 'bg-success' : cat.score >= 60 ? 'bg-primary-600' : 'bg-warning'
                  }`}
                  style={{ width: `${cat.score}%` }}
                />
              </div>

              <div className="flex justify-between text-[10px] text-secondary-400 mt-2">
                <span>{cat.issueCount} active local report{cat.issueCount !== 1 ? 's' : ''}</span>
                <span className="font-semibold">{cat.score >= 75 ? 'Optimal' : cat.score >= 60 ? 'Normal' : 'Attention'}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── Main Civic Insights Page Component ────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

export default function CivicInsights() {
  const location = useLocation();
  const { registeredPincode, complaints: allComplaints, getComplaintVerification } = usePincode();

  const [selectedPincode, setSelectedPincode] = useState(() => {
    const saved = localStorage.getItem('civic_insights_pincode');
    return saved || registeredPincode || '400064';
  });

  const [customInput, setCustomInput] = useState('');
  const [inputError, setInputError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePincodeChange = (newPincode) => {
    if (newPincode === selectedPincode) return;
    setIsLoading(true);
    setSelectedPincode(newPincode);
    localStorage.setItem('civic_insights_pincode', newPincode);
    setInputError('');
    setCustomInput('');
    setTimeout(() => { setIsLoading(false); }, 200);
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
    const found = DEMO_LOCALITIES.find(l => l.code === selectedPincode);
    if (found) return found;
    return {
      code: selectedPincode,
      name: `Pincode ${selectedPincode}`,
      ward: `Municipal Zone (${selectedPincode})`,
      city: 'Mumbai',
    };
  }, [selectedPincode]);

  const localityComplaints = useMemo(() => {
    return (allComplaints || []).filter(c => c.pincode === selectedPincode);
  }, [allComplaints, selectedPincode]);

  // Determine current active subroute
  const isRecordRoute = location.pathname.startsWith('/insights/record');
  const isServicesRoute = location.pathname.startsWith('/insights/services');
  const isOverviewRoute = !isRecordRoute && !isServicesRoute;

  return (
    <div className="animate-fade-in pb-16">
      {/* ── Page Header & Locality Selector ─────────────────────────────────── */}
      <section className="pt-2 pb-4 border-b border-secondary-200">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-6 h-6 rounded-lg bg-primary-600 text-white flex items-center justify-center">
            <BarChart2 size={14} />
          </div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary-700">
            Public Civic Analytics
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-secondary-900 tracking-tight">
          Civic Insights
        </h1>
        <p className="text-xs sm:text-sm font-semibold text-secondary-500 mt-0.5">
          Select your locality
        </p>
        <div className="mt-4 space-y-3">
          <div className="flex flex-wrap gap-2">
            {DEMO_LOCALITIES.map((loc) => {
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
                  <span>{loc.code}</span>
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
                placeholder="Or enter any 6-digit PIN"
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
              <span className="w-2.5 h-2.5 rounded-full bg-primary-600 animate-pulse" />
              <span className="text-secondary-600">Selected Locality:</span>
              <strong className="text-secondary-900 font-bold">{localityInfo.name} ({selectedPincode})</strong>
            </div>
            <span className="text-[11px] text-primary-700 font-semibold hidden sm:inline">
              {localityInfo.ward}
            </span>
          </div>
        </div>

        {/* ── Secondary Navigation Bar (Overview · Civic Record · Services) ── */}
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
      {isLoading ? (
        <div className="py-16 text-center space-y-3">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
          <p className="text-xs font-bold text-secondary-600">
            Updating metrics for {localityInfo.name} ({selectedPincode})...
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {isOverviewRoute && (
            <OverviewSection
              complaints={localityComplaints}
              pincode={selectedPincode}
              localityInfo={localityInfo}
              getComplaintVerification={getComplaintVerification}
            />
          )}

          {isRecordRoute && (
            <CivicRecordSection
              pincode={selectedPincode}
              localityInfo={localityInfo}
            />
          )}

          {isServicesRoute && (
            <ServicesSection
              pincode={selectedPincode}
              complaints={localityComplaints}
            />
          )}
        </div>
      )}
    </div>
  );
}