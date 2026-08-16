import React, { useState, useMemo } from 'react';
import {
  BarChart2,
  MapPin,
  Search,
  TrendingUp,
  TrendingDown,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Activity,
  Star,
  Info,
  Layers,
  Sparkles,
  RefreshCw,
  ChevronRight,
  Flame,
  ThumbsUp,
  Lock,
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
  Legend,
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
    subZones: [
      { name: 'Orlem Junction', level: 'high', count: 6, topIssue: 'Road Damage' },
      { name: 'Link Road Commercial', level: 'elevated', count: 4, topIssue: 'Traffic / Potholes' },
      { name: 'Evershine Nagar', level: 'moderate', count: 3, topIssue: 'Garbage Disposal' },
      { name: 'Marve Road', level: 'moderate', count: 2, topIssue: 'Street Lighting' },
      { name: 'Chincholi Bunder', level: 'low', count: 1, topIssue: 'Water Pressure' },
      { name: 'Mindspace Sector', level: 'low', count: 1, topIssue: 'Park Maintenance' },
    ],
  },
  {
    code: '400067',
    name: 'Kandivali West',
    ward: 'Ward 31 · R/South Ward',
    city: 'Mumbai',
    subZones: [
      { name: 'Mahavir Nagar', level: 'high', count: 7, topIssue: 'Water Pipeline' },
      { name: 'Charkop Sector 2', level: 'elevated', count: 4, topIssue: 'Drainage Clog' },
      { name: 'MG Road Market', level: 'moderate', count: 3, topIssue: 'Sanitation' },
      { name: 'Kandivali Station West', level: 'high', count: 5, topIssue: 'Road Resurfacing' },
      { name: 'Dahanukar Wadi', level: 'low', count: 1, topIssue: 'Streetlights' },
      { name: 'Poisar Naka', level: 'low', count: 1, topIssue: 'Tree Pruning' },
    ],
  },
  {
    code: '400076',
    name: 'Powai',
    ward: 'Ward 12 · S Ward',
    city: 'Mumbai',
    subZones: [
      { name: 'Hiranandani Sector 4', level: 'high', count: 8, topIssue: 'Water Supply' },
      { name: 'Powai Lake Promenade', level: 'elevated', count: 5, topIssue: 'Streetlights' },
      { name: 'JVLR Junction', level: 'moderate', count: 3, topIssue: 'Potholes' },
      { name: 'Central Avenue', level: 'moderate', count: 2, topIssue: 'Garbage Clearance' },
      { name: 'Galleria Commercial', level: 'low', count: 2, topIssue: 'Drainage' },
      { name: 'IIT Main Gate', level: 'low', count: 1, topIssue: 'Pedestrian Walkway' },
    ],
  },
  {
    code: '400054',
    name: 'Santacruz West',
    ward: 'Ward 84 · H/West Ward',
    city: 'Mumbai',
    subZones: [
      { name: 'Linking Road Shopping', level: 'high', count: 6, topIssue: 'Stormwater Drainage' },
      { name: 'Willingdon Gymkhana', level: 'elevated', count: 4, topIssue: 'Waterlogging' },
      { name: 'Tagore Road', level: 'moderate', count: 3, topIssue: 'Road Repair' },
      { name: 'Station Road', level: 'elevated', count: 4, topIssue: 'Waste Management' },
      { name: 'Juhu Koliwada Border', level: 'low', count: 2, topIssue: 'Streetlights' },
      { name: 'Hasnabad Lane', level: 'low', count: 1, topIssue: 'Pavements' },
    ],
  },
];

const SERVICE_CATEGORIES = [
  { key: 'roads',       label: 'Roads & Potholes',    emoji: '🛣️', dept: 'Public Works' },
  { key: 'water',       label: 'Water Supply',         emoji: '💧', dept: 'Water Board' },
  { key: 'sanitation',  label: 'Sanitation & Waste',   emoji: '🗑️', dept: 'Solid Waste Mgmt' },
  { key: 'streetlight', label: 'Streetlights',         emoji: '💡', dept: 'Public Lighting' },
  { key: 'drainage',    label: 'Drainage & Stormwater',emoji: '🌊', dept: 'Stormwater Drainage' },
  { key: 'parks',       label: 'Parks & Green Spaces', emoji: '🌳', dept: 'Gardens Dept.' },
  { key: 'electricity', label: 'Electricity & Grid',   emoji: '⚡', dept: 'Electricity Dept.' },
];

function generate5YearHistory(pincode) {
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
    // In progress is roughly 60% of unresolved, pending is the remainder
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
      rate, // backward compatible
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

    // Determine neutral outcome trend: improving | stable | declining
    let outcomeTrend = 'stable';
    if (rateDiff >= 3 || timeDiff <= -0.8) {
      outcomeTrend = 'improving';
    } else if (rateDiff <= -3 || timeDiff >= 0.8) {
      outcomeTrend = 'declining';
    }

    const neutralSummary = [];

    // Resolution rate neutral statement
    if (rateDiff > 0) {
      neutralSummary.push(`Resolution rate increased from ${prev.resolutionRate}% to ${item.resolutionRate}% (+${rateDiff}% vs ${prev.year}).`);
    } else if (rateDiff < 0) {
      neutralSummary.push(`Resolution rate decreased from ${prev.resolutionRate}% to ${item.resolutionRate}% (${rateDiff}% vs ${prev.year}).`);
    } else {
      neutralSummary.push(`Resolution rate remained stable at ${item.resolutionRate}%.`);
    }

    // Resolution time neutral statement
    if (timeDiff < 0) {
      neutralSummary.push(`Average resolution time decreased from ${prev.avgResolutionTime}d to ${item.avgResolutionTime}d (${Math.abs(timeDiff)} days faster).`);
    } else if (timeDiff > 0) {
      neutralSummary.push(`Average resolution time increased from ${prev.avgResolutionTime}d to ${item.avgResolutionTime}d (+${timeDiff} days).`);
    } else {
      neutralSummary.push(`Average resolution time remained unchanged at ${item.avgResolutionTime} days.`);
    }

    // Complaint volume neutral statement
    if (volumeDiff > 0) {
      neutralSummary.push(`Complaint volume increased from ${prev.total} to ${item.total} (+${volumeDiff} complaints).`);
    } else if (volumeDiff < 0) {
      neutralSummary.push(`Complaint volume decreased from ${prev.total} to ${item.total} (${volumeDiff} complaints).`);
    } else {
      neutralSummary.push(`Complaint volume remained unchanged.`);
    }

    // Major service category neutral statement
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

function getServiceScore(pincode, key, liveComplaints = []) {
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

function getScoreBadgeColor(score) {
  if (score >= 75) return 'text-success bg-green-50 border-green-200';
  if (score >= 60) return 'text-primary-700 bg-primary-50 border-primary-200';
  if (score >= 48) return 'text-warning bg-amber-50 border-amber-200';
  return 'text-error bg-red-50 border-red-200';
}

function getScoreText(score) {
  if (score >= 82) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 58) return 'Moderate';
  if (score >= 45) return 'Needs Attention';
  return 'Critical Work Required';
}

function getHeatmapColor(level) {
  switch (level) {
    case 'high': return 'bg-red-500 text-white';
    case 'elevated': return 'bg-amber-500 text-white';
    case 'moderate': return 'bg-amber-300 text-secondary-900';
    case 'low': default: return 'bg-green-400 text-secondary-900';
  }
}

function getHeatmapBg(level) {
  switch (level) {
    case 'high': return 'bg-red-50 border-red-200 text-red-800';
    case 'elevated': return 'bg-orange-50 border-orange-200 text-orange-800';
    case 'moderate': return 'bg-amber-50 border-amber-200 text-amber-800';
    case 'low': default: return 'bg-green-50 border-green-200 text-green-800';
  }
}

// ── Reusable Section Atoms ────────────────────────────────────────────────────

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
  trend, trendUp, isDemo = false,
}) {
  return (
    <div className={`relative flex flex-col justify-between p-4 rounded-2xl border bg-surface transition-all hover:shadow-md hover:-translate-y-[1px] group ${isDemo ? 'border-amber-200 bg-amber-50/30' : 'border-secondary-200'}`}>
      {/* Demo watermark */}
      {isDemo && (
        <span className="absolute top-2 right-2 text-[9px] font-extrabold uppercase tracking-wide text-amber-500 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full">
          Demo
        </span>
      )}

      {/* Icon + label row */}
      <div className="flex items-start justify-between mb-3">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
          <Icon size={16} className={iconColor} />
        </div>
        {badge && <div className="ml-2">{badge}</div>}
      </div>

      {/* Value */}
      <div>
        <p className={`text-2xl font-black leading-none ${valueColor}`}>{value}</p>
        {sub && (
          <p className="text-[11px] text-secondary-400 font-medium mt-0.5">{sub}</p>
        )}
        {trend !== undefined && (
          <div className={`flex items-center gap-1 mt-1 text-[11px] font-semibold ${trendUp ? 'text-success' : 'text-error'}`}>
            {trendUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            <span>{trend}</span>
          </div>
        )}
      </div>

      {/* Label */}
      <p className="text-xs font-semibold text-secondary-600 mt-2 leading-snug">{label}</p>

      {/* Tooltip on hover */}
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

// ── Helper: parse estimatedResolution string → approximate days ───────────────

function parseEstimatedDays(str) {
  if (!str || str === 'Resolved') return null;
  const match = str.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

// ── 1. Current Civic Snapshot ─────────────────────────────────────────────────

function CurrentSnapshotSection({ complaints, pincode, localityInfo, getComplaintVerification }) {
  const total = complaints.length;

  // Core status counts
  const resolved   = complaints.filter(c => c.status === 'resolved').length;
  const inProgress = complaints.filter(c => c.status === 'in_progress').length;
  // Pending = not resolved and not actively being worked (open / reported / verified / assigned)
  const pending    = complaints.filter(c =>
    !['resolved', 'in_progress'].includes(c.status)
  ).length;
  const highPriority = complaints.filter(c =>
    c.priority === 'urgent' || c.priority === 'high'
  ).length;

  // Resolution Rate — live from data
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  // Average Resolution Time
  // Since there's no resolvedAt field, we approximate from estimatedResolution for resolved complaints.
  // This is clearly labelled as a prototype estimate.
  const resolvedComplaints = complaints.filter(c => c.status === 'resolved');
  let avgResolutionDays = null;
  let avgResolutionIsDemo = false;
  if (resolvedComplaints.length > 0) {
    const parsed = resolvedComplaints
      .map(c => parseEstimatedDays(c.estimatedResolution))
      .filter(d => d !== null);
    if (parsed.length > 0) {
      avgResolutionDays = Math.round(parsed.reduce((a, b) => a + b, 0) / parsed.length);
      avgResolutionIsDemo = true; // derived from estimatedResolution, not a real timestamp
    }
  }
  // If still no data, fall back to a pincode-seeded demo value
  if (avgResolutionDays === null) {
    const pinNum = parseInt(pincode, 10) || 400000;
    avgResolutionDays = 3 + (pinNum % 5); // 3–7 days
    avgResolutionIsDemo = true;
  }

  // Citizen Confirmation Rate — aggregate verifications across all locality complaints
  // confirmedCount / (confirmedCount + notConfirmedCount) for complaints that have votes
  let totalConfirmed = 0;
  let totalVerificationVotes = 0;
  let confirmationIsDemo = false;

  if (getComplaintVerification && complaints.length > 0) {
    complaints.forEach(c => {
      const v = getComplaintVerification(c._id);
      if (v && v.totalResponses > 0) {
        totalConfirmed += v.confirmedCount;
        totalVerificationVotes += v.totalResponses;
      }
    });
  }

  let citizenConfirmationRate = 0;
  if (totalVerificationVotes > 0) {
    citizenConfirmationRate = Math.round((totalConfirmed / totalVerificationVotes) * 100);
  } else {
    // No verifications in this locality — use demo fallback
    const pinNum = parseInt(pincode, 10) || 400000;
    citizenConfirmationRate = 78 + (pinNum % 14);
    confirmationIsDemo = true;
  }

  // No data state
  const isEmpty = total === 0;

  return (
    <div>
      <SectionHeader number="1" title="Current Civic Snapshot" badge={<LiveBadge />} />

      {isEmpty ? (
        <div className="p-8 text-center rounded-2xl border border-dashed border-secondary-200 bg-secondary-50">
          <Activity size={32} className="mx-auto mb-3 text-secondary-300" />
          <p className="text-sm font-bold text-secondary-500">No complaints recorded for {localityInfo?.name || `Pincode ${pincode}`} yet.</p>
          <p className="text-xs text-secondary-400 mt-1">Metrics will appear once citizens report civic issues in this area.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* ── Row 1: Count KPIs ─────────────────────────────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <KpiCard
              label="Total Issues Reported"
              value={total}
              sub={`in ${localityInfo?.ward || `Pincode ${pincode}`}`}
              icon={Activity}
              iconBg="bg-secondary-100"
              iconColor="text-secondary-600"
              tooltip="All complaints submitted for this locality in the live system"
            />
            <KpiCard
              label="Resolved"
              value={resolved}
              sub={total > 0 ? `${Math.round((resolved / total) * 100)}% of total` : '—'}
              icon={CheckCircle2}
              iconBg="bg-green-100"
              iconColor="text-success"
              valueColor="text-success"
              tooltip="Complaints confirmed resolved by the municipal department"
            />
            <KpiCard
              label="In Progress"
              value={inProgress}
              sub="Actively being worked"
              icon={RefreshCw}
              iconBg="bg-amber-100"
              iconColor="text-warning"
              valueColor="text-warning"
              tooltip="Complaints currently assigned to a municipal team"
            />
            <KpiCard
              label="Pending"
              value={pending}
              sub="Awaiting municipal action"
              icon={Clock}
              iconBg="bg-blue-100"
              iconColor="text-primary-600"
              valueColor="text-primary-700"
              tooltip="Open, reported, or verified complaints not yet in active resolution"
            />
          </div>

          {/* ── Row 2: Performance KPIs ──────────────────────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <KpiCard
              label="High Priority Issues"
              value={highPriority}
              sub="Urgent or high severity"
              icon={Flame}
              iconBg="bg-red-100"
              iconColor="text-error"
              valueColor={highPriority > 0 ? 'text-error' : 'text-success'}
              tooltip="Complaints flagged as Urgent or High priority by citizens and AI"
            />
            <KpiCard
              label="Avg. Resolution Time"
              value={`~${avgResolutionDays}d`}
              sub="Days to resolve"
              icon={Clock}
              iconBg="bg-purple-100"
              iconColor="text-purple-600"
              valueColor="text-purple-700"
              isDemo={avgResolutionIsDemo}
              tooltip={avgResolutionIsDemo
                ? 'Estimated from complaint resolution timelines · No verified timestamp data yet'
                : 'Calculated from complaint creation to resolution date'}
            />
            <KpiCard
              label="Resolution Rate"
              value={`${resolutionRate}%`}
              sub="Resolved ÷ Total Issues"
              icon={TrendingUp}
              iconBg="bg-green-100"
              iconColor="text-success"
              valueColor={resolutionRate >= 60 ? 'text-success' : resolutionRate >= 40 ? 'text-warning' : 'text-error'}
              tooltip="Percentage of all reported issues that have been fully resolved"
            />
            <KpiCard
              label="Citizen Confirmation Rate"
              value={`${citizenConfirmationRate}%`}
              sub="Citizens who confirmed issue"
              icon={ThumbsUp}
              iconBg="bg-indigo-100"
              iconColor="text-indigo-600"
              valueColor="text-indigo-700"
              isDemo={confirmationIsDemo}
              tooltip={confirmationIsDemo
                ? 'Demo estimate · No verification votes recorded for this locality yet'
                : 'Percentage of status verification votes that confirmed the issue'}
            />
          </div>

          {/* ── Resolution Rate Visual Bar ───────────────────────────────── */}
          <div className="p-4 bg-surface rounded-2xl border border-secondary-200 space-y-3">
            <ResolutionRateBar rate={resolutionRate} label={`Resolution Rate · ${localityInfo?.name || `Pincode ${pincode}`}`} />

            {/* Status breakdown strip */}
            {total > 0 && (
              <div className="flex rounded-lg overflow-hidden h-2 mt-2" title="Status breakdown">
                {resolved > 0 && (
                  <div className="bg-success" style={{ width: `${(resolved / total) * 100}%` }} title={`Resolved: ${resolved}`} />
                )}
                {inProgress > 0 && (
                  <div className="bg-warning" style={{ width: `${(inProgress / total) * 100}%` }} title={`In Progress: ${inProgress}`} />
                )}
                {pending > 0 && (
                  <div className="bg-primary-300" style={{ width: `${(pending / total) * 100}%` }} title={`Pending: ${pending}`} />
                )}
              </div>
            )}

            {/* Legend */}
            <div className="flex flex-wrap gap-3 text-[10px] font-semibold text-secondary-500 pt-0.5">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-success inline-block" />Resolved ({resolved})</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-warning inline-block" />In Progress ({inProgress})</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary-300 inline-block" />Pending ({pending})</span>
            </div>

            {/* Data notes */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 border-t border-secondary-100 text-[10px] text-secondary-400">
              <span><span className="text-success font-bold">●</span> Live complaint data</span>
              {(avgResolutionIsDemo || confirmationIsDemo) && (
                <span><span className="text-amber-500 font-bold">●</span> Demo-estimated metrics clearly labelled</span>
              )}
              <span className="ml-auto flex items-center gap-1">
                <MapPin size={10} className="text-primary-500" />
                {localityInfo?.ward || `Pincode ${pincode}`}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// ── 2. 5-Year Civic Record ───────────────────────────────────────────────────

function FiveYearRecordSection({ pincode, localityInfo }) {
  const [activeChartTab, setActiveChartTab] = useState('all'); // 'all' | 'volume' | 'rate' | 'time'
  const historyData = useMemo(() => generate5YearHistory(pincode), [pincode]);
  const [selectedYear, setSelectedYear] = useState('2026');

  // Find active year object
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

  // Helper for trend badge styling
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
    <div>
      <SectionHeader
        number="2"
        title="5-Year Civic Record"
        badge={
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-[10px] font-bold text-amber-700">
            <span>📊</span>
            <span>Prototype/Demo Data</span>
          </span>
        }
      />

      <Card variant="flat" className="p-4 sm:p-5 space-y-5">
        {/* Header description & neutral period labeling */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-secondary-100">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-secondary-900">
                Civic Service Trends
              </span>
              <span className="px-2 py-0.5 rounded-md bg-primary-50 text-primary-700 font-bold text-[11px] border border-primary-100">
                Representation Period: 2022–2026
              </span>
            </div>
            <p className="text-[11px] text-secondary-500 mt-1">
              Civic outcomes recorded during the selected period for <strong>Pincode {pincode}</strong> ({localityInfo?.name || 'Local Area'}).
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto flex-shrink-0">
            <span className="text-xs font-black text-success bg-green-50 border border-green-200 px-2.5 py-1 rounded-lg">
              +{summary.rateGain}% 5-Yr Resolution Gain
            </span>
          </div>
        </div>

        {/* ── Visual Civic Timeline (2022 – 2026) ── */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary-600 animate-pulse" />
              <h3 className="text-xs font-bold text-secondary-900">
                Visual Civic Timeline (2022–2026)
              </h3>
            </div>
            <span className="text-[11px] text-secondary-400">
              Click a year to highlight metrics
            </span>
          </div>

          {/* Timeline Track & Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
            {historyData.map((item, idx) => {
              const isSelected = item.year === selectedYear;
              const trendStyle = getTrendStyle(item.outcomeTrend);
              const TrendIcon = trendStyle.icon;

              return (
                <button
                  key={item.year}
                  type="button"
                  onClick={() => setSelectedYear(item.year)}
                  className={`text-left p-3 rounded-2xl border transition-all relative flex flex-col justify-between group ${
                    isSelected
                      ? 'bg-primary-50/40 border-primary-500 shadow-md ring-2 ring-primary-500/20'
                      : 'bg-surface border-secondary-200 hover:border-primary-300 hover:bg-secondary-50/50'
                  }`}
                >
                  {/* Top: Year & Outcome Trend Pill */}
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className={`text-sm font-black ${isSelected ? 'text-primary-700' : 'text-secondary-900'}`}>
                      {item.year}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold border ${trendStyle.bg}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${trendStyle.dot}`} />
                      {trendStyle.label}
                    </span>
                  </div>

                  {/* 4 Required Metric Data Points */}
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
                      <p className="text-[10px] text-secondary-400 truncate">Major Service:</p>
                      <p className="text-[10px] font-bold text-secondary-800 truncate flex items-center gap-1">
                        <span>{item.majorCategoryEmoji}</span>
                        <span>{item.majorCategory}</span>
                      </p>
                    </div>
                  </div>

                  {/* Active selection bottom indicator */}
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

          {/* Selected Year Detailed Spotlight Card */}
          {activeYearData && (
            <div className="p-3.5 bg-secondary-50/70 rounded-2xl border border-secondary-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 pb-2 border-b border-secondary-200">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-secondary-900">
                    Year {activeYearData.year} Civic Outcome Spotlight
                  </span>
                  {(() => {
                    const ts = getTrendStyle(activeYearData.outcomeTrend);
                    return (
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${ts.bg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${ts.dot}`} />
                        Outcome Trend: {ts.label}
                      </span>
                    );
                  })()}
                </div>

                <span className="text-[11px] text-secondary-500 font-medium">
                  {activeYearData.resolved.toLocaleString()} of {activeYearData.total.toLocaleString()} complaints resolved ({activeYearData.resolutionRate}%)
                </span>
              </div>

              {/* Neutral Factual Observation Bullet points */}
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
        </div>

        {/* 5-Year Aggregate Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-3 bg-secondary-50/80 rounded-xl border border-secondary-100">
            <p className="text-[10px] uppercase font-bold text-secondary-400">5-Yr Total Complaints</p>
            <p className="text-lg font-black text-secondary-900 mt-0.5">{summary.totalAll5Yrs.toLocaleString()}</p>
            <p className="text-[10px] text-secondary-500">2022–2026 logged</p>
          </div>
          <div className="p-3 bg-green-50/60 rounded-xl border border-green-100">
            <p className="text-[10px] uppercase font-bold text-green-700">5-Yr Total Resolved</p>
            <p className="text-lg font-black text-green-800 mt-0.5">{summary.resolvedAll5Yrs.toLocaleString()}</p>
            <p className="text-[10px] text-green-600">{summary.overall5YrRate}% cumulative rate</p>
          </div>
          <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100">
            <p className="text-[10px] uppercase font-bold text-primary-700">Resolution Rate Jump</p>
            <p className="text-lg font-black text-primary-800 mt-0.5">{historyData[0].resolutionRate}% → {historyData[4].resolutionRate}%</p>
            <p className="text-[10px] text-primary-600">+{summary.rateGain}% efficiency growth</p>
          </div>
          <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100">
            <p className="text-[10px] uppercase font-bold text-purple-700">Resolution Speed</p>
            <p className="text-lg font-black text-purple-800 mt-0.5">{historyData[0].avgResolutionTime}d → {historyData[4].avgResolutionTime}d</p>
            <p className="text-[10px] text-purple-600">{summary.timeImprovement}% faster turnaround</p>
          </div>
        </div>

        {/* Chart View Selector Tabs */}
        <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
          <span className="text-xs font-semibold text-secondary-600">Interactive Visualizations:</span>
          <div className="inline-flex p-0.5 bg-secondary-100 rounded-lg text-xs">
            <button
              onClick={() => setActiveChartTab('all')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                activeChartTab === 'all'
                  ? 'bg-surface text-secondary-900 shadow-sm'
                  : 'text-secondary-600 hover:text-secondary-900'
              }`}
            >
              All Trends
            </button>
            <button
              onClick={() => setActiveChartTab('volume')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                activeChartTab === 'volume'
                  ? 'bg-surface text-secondary-900 shadow-sm'
                  : 'text-secondary-600 hover:text-secondary-900'
              }`}
            >
              1. Complaints Volume & Status
            </button>
            <button
              onClick={() => setActiveChartTab('rate')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                activeChartTab === 'rate'
                  ? 'bg-surface text-secondary-900 shadow-sm'
                  : 'text-secondary-600 hover:text-secondary-900'
              }`}
            >
              2. Resolution Rate (%)
            </button>
            <button
              onClick={() => setActiveChartTab('time')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                activeChartTab === 'time'
                  ? 'bg-surface text-secondary-900 shadow-sm'
                  : 'text-secondary-600 hover:text-secondary-900'
              }`}
            >
              3. Resolution Time (Days)
            </button>
          </div>
        </div>

        {/* ── Chart 1: Total Complaints & Status Breakdown ── */}
        {(activeChartTab === 'all' || activeChartTab === 'volume') && (
          <div className="p-3.5 bg-surface rounded-xl border border-secondary-200">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-xs font-bold text-secondary-800">
                  1. Total Complaints & Status Breakdown by Year (2022–2026)
                </p>
                <p className="text-[11px] text-secondary-400">
                  Stacked breakdown of Resolved, In Progress, and Pending complaints
                </p>
              </div>
              <div className="flex items-center gap-3 text-[11px] font-medium text-secondary-500">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#16A34A]" /> Resolved
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#2563EB]" /> In Progress
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#D97706]" /> Pending
                </span>
              </div>
            </div>

            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={historyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                  <XAxis dataKey="year" tickLine={false} axisLine={{ stroke: '#E5E7EB' }} tick={{ fontSize: 11, fill: '#6B7280' }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                  <Tooltip
                    contentStyle={CUSTOM_TOOLTIP_STYLE}
                    formatter={(val, name) => {
                      const labels = {
                        resolved: 'Resolved',
                        inProgress: 'In Progress',
                        pending: 'Pending',
                        total: 'Total Complaints',
                      };
                      return [val.toLocaleString(), labels[name] || name];
                    }}
                    labelFormatter={(label) => `Year ${label} · Complaints Distribution`}
                  />
                  <Bar dataKey="resolved" name="resolved" stackId="a" fill="#16A34A" radius={[0, 0, 0, 0]} barSize={32} />
                  <Bar dataKey="inProgress" name="inProgress" stackId="a" fill="#2563EB" radius={[0, 0, 0, 0]} barSize={32} />
                  <Bar dataKey="pending" name="pending" stackId="a" fill="#D97706" radius={[4, 4, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ── Chart 2: Resolution Rate Trend ── */}
        {(activeChartTab === 'all' || activeChartTab === 'rate') && (
          <div className="p-3.5 bg-surface rounded-xl border border-secondary-200">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-xs font-bold text-secondary-800">
                  2. Annual Resolution Rate (%) Trend (2022–2026)
                </p>
                <p className="text-[11px] text-secondary-400">
                  Percentage of logged complaints resolved within the respective civic calendar year
                </p>
              </div>
              <span className="text-xs font-black text-primary-700 bg-primary-50 px-2 py-0.5 rounded">
                Current: {historyData[4].resolutionRate}%
              </span>
            </div>

            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="rateGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                  <XAxis dataKey="year" tickLine={false} axisLine={{ stroke: '#E5E7EB' }} tick={{ fontSize: 11, fill: '#6B7280' }} />
                  <YAxis domain={[0, 100]} tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} tickFormatter={(v) => `${v}%`} />
                  <Tooltip
                    contentStyle={CUSTOM_TOOLTIP_STYLE}
                    formatter={(val) => [`${val}%`, 'Resolution Rate']}
                    labelFormatter={(label) => `Civic Year ${label}`}
                  />
                  <Area type="monotone" dataKey="resolutionRate" stroke="#2563EB" strokeWidth={2.5} fillOpacity={1} fill="url(#rateGradient)" dot={{ r: 4, fill: '#2563EB', strokeWidth: 2, stroke: '#FFFFFF' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ── Chart 3: Average Resolution Time Trend ── */}
        {(activeChartTab === 'all' || activeChartTab === 'time') && (
          <div className="p-3.5 bg-surface rounded-xl border border-secondary-200">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-xs font-bold text-secondary-800">
                  3. Average Resolution Time by Year (2022–2026)
                </p>
                <p className="text-[11px] text-secondary-400">
                  Mean turnaround duration in days between ticket lodging and civic closure
                </p>
              </div>
              <span className="text-xs font-black text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                Fastest: {historyData[4].avgResolutionTime} Days
              </span>
            </div>

            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={historyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                  <XAxis dataKey="year" tickLine={false} axisLine={{ stroke: '#E5E7EB' }} tick={{ fontSize: 11, fill: '#6B7280' }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} tickFormatter={(v) => `${v}d`} />
                  <Tooltip
                    contentStyle={CUSTOM_TOOLTIP_STYLE}
                    formatter={(val) => [`${val} Days`, 'Average Resolution Time']}
                    labelFormatter={(label) => `Civic Year ${label}`}
                  />
                  <Bar dataKey="avgResolutionTime" fill="#8B5CF6" radius={[4, 4, 0, 0]} barSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Comprehensive 5-Year Data Table & Yearly Cards */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-secondary-800">
              Detailed 5-Year Metric Breakdown (2022 – 2026)
            </p>
            <span className="text-[11px] text-secondary-400">
              Selected Year highlighted in table
            </span>
          </div>

          {/* Mobile-friendly Grid / Responsive Table */}
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
            This data reflects public utility and service operations and is not affiliated with or representative of any specific individual or political campaign.
          </p>
        </div>
      </Card>
    </div>
  );
}

// ── 3. Civic Health Score (CivicPulse Score) ──────────────────────────────────

function CivicHealthScoreSection({ pincode, complaints, localityInfo, getComplaintVerification }) {
  const pinNum = parseInt(pincode, 10) || 400000;
  const pinOffset = pinNum % 17;

  // 1. Resolution Rate Component (30% weight)
  const totalCount = complaints.length;
  const resolvedCount = complaints.filter(c => c.status === 'resolved').length;
  const rawResolutionRate = totalCount > 0
    ? (resolvedCount / totalCount) * 100
    : (68 + (pinOffset % 18));
  const resolutionRateScore = Math.min(100, Math.max(0, Math.round(rawResolutionRate)));

  // 2. Response Speed Component (20% weight)
  // Faster resolution turnaround -> higher score (0-100)
  // Baseline demo days: 4 to 12 days; 3 days = 95, 14 days = 45
  const avgDaysEstimate = Math.max(3, 11 - (pinOffset * 0.45));
  const rawResponseSpeed = Math.max(30, Math.min(98, Math.round(100 - (avgDaysEstimate * 4.5))));
  const responseSpeedScore = rawResponseSpeed;

  // 3. Pending Issue Reduction Component (20% weight)
  const pendingCount = complaints.filter(c => c.status !== 'resolved' && c.status !== 'in_progress').length;
  const pendingRatio = totalCount > 0 ? (pendingCount / totalCount) : 0.22;
  const rawPendingReduction = Math.max(35, Math.min(98, Math.round((1 - pendingRatio) * 92 + (pinOffset % 6))));
  const pendingReductionScore = rawPendingReduction;

  // 4. High-Priority Resolution Component (15% weight)
  const highPriorityItems = complaints.filter(c => c.priority === 'urgent' || c.priority === 'high');
  const highPriorityResolved = highPriorityItems.filter(c => c.status === 'resolved').length;
  const rawHighPriority = highPriorityItems.length > 0
    ? (highPriorityResolved / highPriorityItems.length) * 100
    : (72 + (pinOffset % 16));
  const highPriorityScore = Math.min(100, Math.max(30, Math.round(rawHighPriority)));

  // 5. Citizen Status Confirmation Component (15% weight)
  let liveConfirmedVotes = 0;
  let liveTotalVotes = 0;
  if (getComplaintVerification) {
    complaints.forEach((c) => {
      const v = getComplaintVerification(c._id);
      if (v) {
        liveConfirmedVotes += (v.confirmedCount || 0);
        liveTotalVotes += (v.totalCount || 0);
      }
    });
  }
  const rawCitizenConfirmation = liveTotalVotes > 0
    ? (liveConfirmedVotes / liveTotalVotes) * 100
    : (78 + (pinOffset % 15));
  const citizenConfirmationScore = Math.min(100, Math.max(35, Math.round(rawCitizenConfirmation)));

  // Calculate Weighted CivicPulse Score
  // Weights: 30%, 20%, 20%, 15%, 15%
  const civicPulseScore = Math.round(
    (resolutionRateScore * 0.30) +
    (responseSpeedScore * 0.20) +
    (pendingReductionScore * 0.20) +
    (highPriorityScore * 0.15) +
    (citizenConfirmationScore * 0.15)
  );

  const components = [
    {
      key: 'resolutionRate',
      name: 'Resolution Rate',
      weight: 30,
      score: resolutionRateScore,
      description: 'Proportion of lodged civic issues successfully resolved',
      color: '#16A34A',
      bgColor: 'bg-green-500',
      tagColor: 'text-green-700 bg-green-50 border-green-200',
    },
    {
      key: 'responseSpeed',
      name: 'Response Speed',
      weight: 20,
      score: responseSpeedScore,
      description: 'Average turnaround duration from ticket lodging to closure',
      color: '#2563EB',
      bgColor: 'bg-primary-600',
      tagColor: 'text-primary-700 bg-primary-50 border-primary-200',
    },
    {
      key: 'pendingReduction',
      name: 'Pending Issue Reduction',
      weight: 20,
      score: pendingReductionScore,
      description: 'Backlog control and active mitigation of unaddressed complaints',
      color: '#8B5CF6',
      bgColor: 'bg-purple-600',
      tagColor: 'text-purple-700 bg-purple-50 border-purple-200',
    },
    {
      key: 'highPriority',
      name: 'High-Priority Resolution',
      weight: 15,
      score: highPriorityScore,
      description: 'Turnaround efficiency on safety, hazardous & urgent reports',
      color: '#D97706',
      bgColor: 'bg-amber-500',
      tagColor: 'text-amber-700 bg-amber-50 border-amber-200',
    },
    {
      key: 'citizenConfirmation',
      name: 'Citizen Status Confirmation',
      weight: 15,
      score: citizenConfirmationScore,
      description: 'Community verification validating actual on-ground resolution',
      color: '#0D9488',
      bgColor: 'bg-teal-600',
      tagColor: 'text-teal-700 bg-teal-50 border-teal-200',
    },
  ];

  // SVG Gauge calculations
  // Radius = 54, Circumference = 2 * PI * 54 ≈ 339.29
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (civicPulseScore / 100) * circumference;

  const scoreTier = civicPulseScore >= 80
    ? { text: 'Optimal Civic Health', color: 'text-success', ringColor: '#16A34A', bgBadge: 'bg-green-50 text-green-700 border-green-200' }
    : civicPulseScore >= 65
    ? { text: 'Good Civic Health', color: 'text-primary-700', ringColor: '#2563EB', bgBadge: 'bg-blue-50 text-primary-700 border-blue-200' }
    : civicPulseScore >= 50
    ? { text: 'Moderate Performance', color: 'text-amber-700', ringColor: '#D97706', bgBadge: 'bg-amber-50 text-amber-700 border-amber-200' }
    : { text: 'Attention Required', color: 'text-error', ringColor: '#DC2626', bgBadge: 'bg-red-50 text-red-700 border-red-200' };

  return (
    <div>
      <SectionHeader
        number="3"
        title="Civic Health Score"
        badge={
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary-50 border border-primary-200 text-[10px] font-bold text-primary-700">
            <span>⚙️</span>
            <span>Prototype Analytical Metric</span>
          </span>
        }
      />

      <Card variant="flat" className="p-4 sm:p-5 space-y-5">
        {/* Main Gauge & Overview Banner */}
        <div className="flex flex-col md:flex-row items-center gap-6 p-4 bg-secondary-50/60 rounded-2xl border border-secondary-200">
          {/* Radial Circular Gauge Meter */}
          <div className="relative flex flex-col items-center justify-center flex-shrink-0">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 128 128">
                {/* Background Track Circle */}
                <circle
                  cx="64"
                  cy="64"
                  r={radius}
                  stroke="#E5E7EB"
                  strokeWidth="10"
                  fill="transparent"
                />
                {/* Foreground Animated Score Ring */}
                <circle
                  cx="64"
                  cy="64"
                  r={radius}
                  stroke={scoreTier.ringColor}
                  strokeWidth="10"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>

              {/* Inside Gauge Center Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-black text-secondary-900 tracking-tight leading-none">
                  {civicPulseScore}
                </span>
                <span className="text-[11px] font-bold text-secondary-400 mt-0.5">
                  / 100
                </span>
              </div>
            </div>

            <span className={`mt-2 px-2.5 py-0.5 rounded-full text-xs font-bold border ${scoreTier.bgBadge}`}>
              {scoreTier.text}
            </span>
          </div>

          {/* Score Header & Description */}
          <div className="flex-1 space-y-2 text-center md:text-left">
            <div>
              <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
                <h3 className="text-lg font-black text-secondary-900 tracking-tight">
                  CivicPulse Score
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-secondary-200/70 text-secondary-700 font-bold text-[10px] uppercase tracking-wider">
                  Prototype Analytical Metric
                </span>
              </div>
              <p className="text-xs text-secondary-500 mt-1">
                Composite evaluation computed for <strong>Pincode {pincode}</strong> ({localityInfo?.name || 'Selected Area'}) based on weighted civic service indicators.
              </p>
            </div>

            {/* Quick summary chips */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1">
              <span className="text-[11px] font-semibold text-secondary-600 bg-surface px-2.5 py-1 rounded-lg border border-secondary-200">
                5 Weighted Dimensions
              </span>
              <span className="text-[11px] font-semibold text-secondary-600 bg-surface px-2.5 py-1 rounded-lg border border-secondary-200">
                Normalized 0–100 Scale
              </span>
              <span className="text-[11px] font-bold text-primary-700 bg-primary-50 px-2.5 py-1 rounded-lg border border-primary-100">
                Dynamic Real-Time Update
              </span>
            </div>
          </div>
        </div>

        {/* 5 Component Breakdown Cards */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-secondary-900">
              Score Component Breakdown (Weighted Matrix)
            </h4>
            <span className="text-[11px] text-secondary-400">
              Total Weight: 100%
            </span>
          </div>

          <div className="space-y-2.5">
            {components.map((comp) => (
              <div
                key={comp.key}
                className="p-3 bg-surface rounded-xl border border-secondary-200 hover:border-primary-300 transition-all space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: comp.color }} />
                    <span className="text-xs font-bold text-secondary-800 truncate">
                      {comp.name}
                    </span>
                    <span className="text-[10px] font-semibold text-secondary-400 hidden sm:inline">
                      ({comp.weight}% Weight)
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded border ${comp.tagColor}`}>
                      {comp.weight}% wt
                    </span>
                    <span className="text-xs font-black text-secondary-900 min-w-[45px] text-right">
                      {comp.score} / 100
                    </span>
                  </div>
                </div>

                {/* Progress Meter Bar */}
                <div className="w-full bg-secondary-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-2 rounded-full transition-all duration-700"
                    style={{
                      width: `${comp.score}%`,
                      backgroundColor: comp.color,
                    }}
                  />
                </div>

                {/* Description line */}
                <p className="text-[10px] text-secondary-400">
                  {comp.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Mandatory Explanation Disclaimer Box */}
        <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200 text-xs text-amber-900 leading-relaxed">
          <div className="flex items-start gap-2">
            <Info size={15} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-900 mb-0.5">Methodology & Transparency Notice:</p>
              <p className="text-amber-800 text-[11px]">
                "CivicPulse Score is a prototype analytical metric based on complaint and community-verification data. It is not an official government rating."
              </p>
              <p className="text-amber-700 text-[10px] mt-1">
                Scores reflect automated algorithmic aggregation of locality civic complaints and community verification votes. No individual political affiliation or official municipal endorsement is implied.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ── 4. Service Performance ───────────────────────────────────────────────────

function ServicePerformanceSection({ pincode, complaints }) {
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
      <SectionHeader number="4" title="Service Performance" badge={<DemoBadge />} />
      <Card variant="flat" className="p-4 space-y-3">
        <p className="text-xs text-secondary-500 leading-relaxed">
          Civic-service operational indices by core municipal department for <strong>Selected Locality {pincode}</strong>.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {categoryScores.map((cat) => (
            <div key={cat.key} className="p-3 bg-secondary-50 rounded-xl border border-secondary-200 flex flex-col justify-between">
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

              <div className="flex justify-between text-[10px] text-secondary-400 mt-1.5">
                <span>{cat.issueCount} active local reports</span>
                <span>{cat.score >= 75 ? 'Optimal' : cat.score >= 60 ? 'Normal' : 'Attention'}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── 5. Community Priorities ──────────────────────────────────────────────────

function CommunityPrioritiesSection({ complaints }) {
  const rankedCategories = useMemo(() => {
    const map = {};
    complaints.forEach((c) => {
      const cat = c.category || 'General Civic';
      if (!map[cat]) map[cat] = { count: 0, upvotes: 0, urgent: 0, items: [] };
      map[cat].count += 1;
      map[cat].upvotes += (c.upvotes || 0);
      if (c.priority === 'urgent' || c.priority === 'high') map[cat].urgent += 1;
      map[cat].items.push(c);
    });

    return Object.entries(map)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.upvotes - a.upvotes || b.count - a.count);
  }, [complaints]);

  return (
    <div>
      <SectionHeader number="5" title="Community Priorities" badge={<LiveBadge />} />
      {rankedCategories.length === 0 ? (
        <Card variant="flat" className="p-6 text-center text-xs text-secondary-400">
          <Info size={24} className="mx-auto mb-2 text-secondary-300" />
          No community upvoted complaints recorded for this locality yet.
        </Card>
      ) : (
        <div className="space-y-2">
          {rankedCategories.map((item, idx) => (
            <div key={item.name} className="p-3.5 bg-surface rounded-xl border border-secondary-200 flex items-center justify-between gap-3 hover:border-primary-300 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-6 h-6 rounded-full bg-primary-50 border border-primary-200 text-primary-700 text-xs font-black flex items-center justify-center flex-shrink-0">
                  {idx + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-secondary-800 truncate">{item.name}</p>
                  <p className="text-[11px] text-secondary-400">
                    {item.count} report{item.count !== 1 ? 's' : ''} {item.urgent > 0 && `· ⚠️ ${item.urgent} flagged high priority`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="text-right">
                  <p className="text-xs font-extrabold text-primary-600 flex items-center justify-end gap-1">
                    <ThumbsUp size={12} /> {item.upvotes}
                  </p>
                  <p className="text-[10px] text-secondary-400">Citizen votes</p>
                </div>
              </div>
            </div>
          ))}
          <p className="text-[11px] text-secondary-400 mt-1.5 italic">
            Ranked directly by citizen votes and community escalation velocity.
          </p>
        </div>
      )}
    </div>
  );
}

// ── 6. Civic Heatmap ─────────────────────────────────────────────────────────

function CivicHeatmapSection({ pincode, localityInfo }) {
  const subZones = localityInfo?.subZones || [
    { name: 'Central Sector', level: 'elevated', count: 5, topIssue: 'Road Infrastructure' },
    { name: 'North Residential', level: 'moderate', count: 3, topIssue: 'Water Pressure' },
    { name: 'Market Boulevard', level: 'high', count: 6, topIssue: 'Garbage Disposal' },
    { name: 'South Avenue', level: 'low', count: 1, topIssue: 'Streetlights' },
  ];

  return (
    <div>
      <SectionHeader number="6" title="Civic Heatmap" badge={<span className="text-[10px] font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full border border-primary-200">Locality Density Map</span>} />
      <Card variant="flat" className="p-4 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div>
            <p className="font-bold text-secondary-800">Sub-Zone Complaint Density & Resolution Hotspots</p>
            <p className="text-[11px] text-secondary-400">Geographic concentration within {localityInfo ? localityInfo.name : `Pincode ${pincode}`}</p>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-secondary-500">
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> Low
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block ml-1" /> Med
            <span className="w-2 h-2 rounded-full bg-red-500 inline-block ml-1" /> High
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
          {subZones.map((zone) => (
            <div
              key={zone.name}
              className={`p-3 rounded-xl border ${getHeatmapBg(zone.level)} transition-all hover:scale-[1.01]`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${getHeatmapColor(zone.level)}`}>
                  {zone.level}
                </span>
                <span className="text-xs font-bold">{zone.count} issues</span>
              </div>
              <p className="text-xs font-bold truncate mt-1">{zone.name}</p>
              <p className="text-[10px] opacity-80 mt-0.5 truncate">Primary: {zone.topIssue}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── 7. What Improved ─────────────────────────────────────────────────────────

function WhatImprovedSection({ complaints }) {
  const resolvedList = complaints.filter(c => c.status === 'resolved');

  return (
    <div>
      <SectionHeader number="7" title="What Improved" badge={<LiveBadge />} />
      {resolvedList.length === 0 ? (
        <Card variant="flat" className="p-5 text-center text-xs text-secondary-400">
          <CheckCircle2 size={24} className="mx-auto mb-2 text-secondary-300" />
          No verified resolved complaints logged for this locality yet.
        </Card>
      ) : (
        <div className="space-y-2">
          {resolvedList.slice(0, 4).map((c) => (
            <div key={c._id} className="p-3.5 bg-green-50 rounded-xl border border-green-200 flex items-start gap-3">
              <CheckCircle2 size={18} className="text-success flex-shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-secondary-900 leading-snug">{c.title}</p>
                <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-secondary-500">
                  <span className="font-semibold text-success">✓ Verified Resolved</span>
                  <span>·</span>
                  <span>{c.category}</span>
                  <span>·</span>
                  <span>{c.ward || 'Municipal Ward'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── 8. Needs Attention ───────────────────────────────────────────────────────

function NeedsAttentionSection({ complaints }) {
  const attentionList = complaints
    .filter(c => c.status !== 'resolved')
    .sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));

  return (
    <div>
      <SectionHeader number="8" title="Needs Attention" badge={<LiveBadge />} />
      {attentionList.length === 0 ? (
        <Card variant="flat" className="p-5 text-center text-xs text-secondary-400">
          <CheckCircle2 size={24} className="mx-auto mb-2 text-success" />
          All active complaints in this locality are currently resolved! 🎉
        </Card>
      ) : (
        <div className="space-y-2">
          {attentionList.slice(0, 4).map((c) => (
            <div key={c._id} className="p-3.5 bg-red-50 rounded-xl border border-red-200 flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5 min-w-0 flex-1">
                <AlertTriangle size={18} className="text-error flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-secondary-900 leading-snug">{c.title}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-secondary-500">
                    <span className="font-semibold text-error uppercase text-[10px]">
                      {c.priority === 'urgent' ? '🔴 Urgent' : c.priority === 'high' ? '🟠 High Priority' : '🟡 Open'}
                    </span>
                    <span>·</span>
                    <span>{c.category}</span>
                    <span>·</span>
                    <span>▲ {c.upvotes || 0} upvotes</span>
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800 flex-shrink-0">
                {c.status.replace('_', ' ')}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── 9. Compare Areas ─────────────────────────────────────────────────────────

function CompareAreasSection({ currentPincode, onSelectPincode, allComplaints }) {
  const comparisonMatrix = useMemo(() => {
    return DEMO_LOCALITIES.map((loc) => {
      const pinNum = parseInt(loc.code, 10);
      const locComplaints = (allComplaints || []).filter(c => c.pincode === loc.code);
      const resolved = locComplaints.filter(c => c.status === 'resolved').length;
      const rate = locComplaints.length > 0 ? Math.round((resolved / locComplaints.length) * 100) : (68 + (pinNum % 18));
      const score = Math.round((rate * 0.6) + ((60 + (pinNum % 25)) * 0.4));

      return {
        ...loc,
        score,
        totalComplaints: locComplaints.length || (12 + (pinNum % 15)),
        resolutionRate: rate,
      };
    });
  }, [allComplaints]);

  return (
    <div>
      <SectionHeader number="9" title="Compare Areas" badge={<span className="text-[10px] text-secondary-400">Benchmark Matrix</span>} />
      <Card variant="flat" className="p-4 space-y-3">
        <p className="text-xs text-secondary-500">
          Cross-locality comparative performance metrics across demo zones.
        </p>

        <div className="space-y-2">
          {comparisonMatrix.map((item) => {
            const isSelected = item.code === currentPincode;
            return (
              <div
                key={item.code}
                className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-primary-50 border-primary-300 ring-1 ring-primary-300'
                    : 'bg-surface border-secondary-200 hover:border-secondary-300'
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-secondary-900">{item.name}</span>
                    <span className="text-[10px] font-bold text-primary-700 bg-white px-1.5 py-0.5 rounded border border-primary-200">
                      {item.code}
                    </span>
                    {isSelected && (
                      <span className="text-[9px] font-extrabold bg-primary-600 text-white px-1.5 py-0.5 rounded-full">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-secondary-400 mt-0.5">{item.ward}</p>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <p className={`text-xs font-extrabold ${getScoreBadgeColor(item.score).split(' ')[0]}`}>
                      Score: {item.score}
                    </p>
                    <p className="text-[10px] text-secondary-400">{item.resolutionRate}% res. rate</p>
                  </div>

                  {!isSelected && (
                    <button
                      onClick={() => onSelectPincode(item.code)}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold bg-secondary-100 hover:bg-primary-600 hover:text-white text-secondary-700 transition-colors"
                      id={`compare-switch-${item.code}`}
                    >
                      View
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

// ── 10. About This Data ──────────────────────────────────────────────────────

function AboutThisDataSection({ pincode }) {
  return (
    <div>
      <SectionHeader number="10" title="About This Data" badge={<span className="text-[10px] text-secondary-400">Disclosures</span>} />
      <Card variant="flat" className="p-4 space-y-3">
        <div className="flex items-start gap-2.5">
          <Info size={16} className="text-primary-500 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-secondary-600 leading-relaxed space-y-2">
            <p>
              <strong>Live Data</strong> — Current Civic Snapshot, Community Priorities, What Improved, and
              Needs Attention metrics are computed directly from active citizen submissions for{' '}
              <strong>Selected Locality {pincode}</strong>.
            </p>
            <p>
              <strong>Demo & Historical Record</strong> — 5-Year Civic Records, Civic Health Scores, and Service Performance charts use clearly labelled prototype/demo estimations until certified multi-year municipal audits are connected.
            </p>
            <p>
              <strong>Civic Outcomes</strong> are reported strictly at the <em>locality level</em>. No individual complaint outcomes or service delays are attributed to any specific elected representative.
            </p>
            <p>
              <strong>Representation Period</strong> refers to standard civic calendar annual terms (January – December).
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ── Main Civic Insights Page Component ────────────────────────────────────────

export default function CivicInsights() {
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
    setTimeout(() => { setIsLoading(false); }, 250);
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
      subZones: [
        { name: 'Central Zone', level: 'moderate', count: 3, topIssue: 'Road Maintenance' },
        { name: 'North Sector', level: 'low', count: 1, topIssue: 'Street Lighting' },
        { name: 'South Sector', level: 'low', count: 1, topIssue: 'Water Pressure' },
      ],
    };
  }, [selectedPincode]);

  const localityComplaints = useMemo(() => {
    return (allComplaints || []).filter(c => c.pincode === selectedPincode);
  }, [allComplaints, selectedPincode]);

  return (
    <div className="animate-fade-in pb-16">
      <section className="pt-2 pb-5 border-b border-secondary-200">
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
      </section>

      {isLoading ? (
        <div className="py-16 text-center space-y-3">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
          <p className="text-xs font-bold text-secondary-600">
            Updating metrics for {localityInfo.name} ({selectedPincode})...
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <CurrentSnapshotSection complaints={localityComplaints} pincode={selectedPincode} localityInfo={localityInfo} getComplaintVerification={getComplaintVerification} />
          <FiveYearRecordSection pincode={selectedPincode} localityInfo={localityInfo} />
          <CivicHealthScoreSection
            pincode={selectedPincode}
            complaints={localityComplaints}
            localityInfo={localityInfo}
            getComplaintVerification={getComplaintVerification}
          />
          <ServicePerformanceSection pincode={selectedPincode} complaints={localityComplaints} />
          <CommunityPrioritiesSection complaints={localityComplaints} />
          <CivicHeatmapSection pincode={selectedPincode} localityInfo={localityInfo} />
          <WhatImprovedSection complaints={localityComplaints} />
          <NeedsAttentionSection complaints={localityComplaints} />
          <CompareAreasSection currentPincode={selectedPincode} onSelectPincode={handlePincodeChange} allComplaints={allComplaints} />
          <AboutThisDataSection pincode={selectedPincode} />
        </div>
      )}
    </div>
  );
}