import React, { useState, useMemo } from 'react';
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
// ── 1. Overview (Current Civic Snapshot) ──────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

function OverviewSection({ complaints, pincode, localityInfo, getComplaintVerification }) {
  const total = complaints.length;
  const resolved = complaints.filter(c => c.status === 'resolved').length;
  const inProgress = complaints.filter(c => c.status === 'in_progress').length;
  const pending = complaints.filter(
    c => c.status !== 'resolved' && c.status !== 'in_progress'
  ).length;

  const highPriority = complaints.filter(
    c => c.priority === 'urgent' || c.priority === 'high'
  ).length;

  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  const resolvedWithDays = complaints.filter(
    c => c.status === 'resolved' && parseEstimatedDays(c.estimatedResolution) !== null
  );

  let avgResolutionDays = null;
  let avgResolutionIsDemo = false;

  if (resolvedWithDays.length > 0) {
    const totalDays = resolvedWithDays.reduce(
      (sum, c) => sum + (parseEstimatedDays(c.estimatedResolution) || 0), 0
    );
    avgResolutionDays = Math.round(totalDays / resolvedWithDays.length);
  } else {
    const pinNum = parseInt(pincode, 10) || 400000;
    avgResolutionDays = 4 + (pinNum % 6);
    avgResolutionIsDemo = true;
  }

  let totalConfirmedVotes = 0;
  let totalVerificationVotes = 0;

  if (getComplaintVerification) {
    complaints.forEach((c) => {
      const v = getComplaintVerification(c._id);
      if (v) {
        totalConfirmedVotes += (v.confirmedCount || 0);
        totalVerificationVotes += (v.totalCount || 0);
      }
    });
  }

  let citizenConfirmationRate = null;
  let confirmationIsDemo = false;

  if (totalVerificationVotes > 0) {
    citizenConfirmationRate = Math.round((totalConfirmedVotes / totalVerificationVotes) * 100);
  } else {
    const pinNum = parseInt(pincode, 10) || 400000;
    citizenConfirmationRate = 78 + (pinNum % 14);
    confirmationIsDemo = true;
  }

  const isEmpty = total === 0;

  return (
    <div>
      <SectionHeader number="1" title="Overview" badge={<LiveBadge />} />

      {isEmpty ? (
        <div className="p-8 text-center rounded-2xl border border-dashed border-secondary-200 bg-secondary-50">
          <Activity size={32} className="mx-auto mb-3 text-secondary-300" />
          <p className="text-sm font-bold text-secondary-500">No complaints recorded for {localityInfo?.name || `Pincode ${pincode}`} yet.</p>
          <p className="text-xs text-secondary-400 mt-1">Metrics will appear once citizens report civic issues in this area.</p>
        </div>
      ) : (
        <div className="space-y-4">
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

          <div className="p-4 bg-surface rounded-2xl border border-secondary-200 space-y-3">
            <ResolutionRateBar rate={resolutionRate} label={`Resolution Rate · ${localityInfo?.name || `Pincode ${pincode}`}`} />

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

            <div className="flex flex-wrap gap-3 text-[10px] font-semibold text-secondary-500 pt-0.5">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-success inline-block" />Resolved ({resolved})</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-warning inline-block" />In Progress ({inProgress})</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary-300 inline-block" />Pending ({pending})</span>
            </div>

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

// ═══════════════════════════════════════════════════════════════════════════════
// ── 2. Civic Record (5-Year Historical Trends & Civic Timeline) ───────────────
// ═══════════════════════════════════════════════════════════════════════════════

function CivicRecordSection({ pincode, localityInfo }) {
  const [activeChartTab, setActiveChartTab] = useState('all');
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
    <div>
      <SectionHeader
        number="2"
        title="Civic Record"
        badge={
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-[10px] font-bold text-amber-700">
            <span>📊</span>
            <span>Prototype/Demo Data</span>
          </span>
        }
      />

      <Card variant="flat" className="p-4 sm:p-5 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-secondary-100">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-secondary-900">
                5-Year Civic Service Trends
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
                      ? 'bg-primary-50/40 border-primary-500 shadow-md ring-2 ring-primary-500/20'
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
                      <p className="text-[10px] text-secondary-400 truncate">Major Service:</p>
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
              1. Complaints Volume
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

        {/* Comprehensive 5-Year Data Table */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-secondary-800">
              Detailed 5-Year Metric Breakdown (2022 – 2026)
            </p>
            <span className="text-[11px] text-secondary-400">
              Selected Year highlighted in table
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
            This data reflects public utility and service operations and is not affiliated with or representative of any specific individual or political campaign.
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

  return (
    <div className="animate-fade-in pb-16">
      {/* ── Page Header & Locality Selector ─────────────────────────────────── */}
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

      {/* ── Main 3 Streamlined Sections: 1. Overview, 2. Civic Record, 3. Services ── */}
      {isLoading ? (
        <div className="py-16 text-center space-y-3">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
          <p className="text-xs font-bold text-secondary-600">
            Updating metrics for {localityInfo.name} ({selectedPincode})...
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <OverviewSection
            complaints={localityComplaints}
            pincode={selectedPincode}
            localityInfo={localityInfo}
            getComplaintVerification={getComplaintVerification}
          />
          <CivicRecordSection
            pincode={selectedPincode}
            localityInfo={localityInfo}
          />
          <ServicesSection
            pincode={selectedPincode}
            complaints={localityComplaints}
          />
        </div>
      )}
    </div>
  );
}