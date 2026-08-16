import React, { useMemo } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area
} from 'recharts';
import {
  PieChart as PieIcon, BarChart2, MapPin, Layers, Flame,
  ThumbsUp, ShieldCheck, Clock, CheckCircle2, TrendingUp, Filter
} from 'lucide-react';
import { usePincode } from '../../context/PincodeContext';

const TOOLTIP_STYLE = {
  borderRadius: 10,
  border: '1px solid #E5E7EB',
  fontSize: 12,
  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  backgroundColor: '#FFFFFF',
};

export default function Analytics() {
  const { allComplaints, getComplaintVotes, getComplaintVerification } = usePincode();

  // ── 1. Complaints by Category Chart Data ──────────────────────────────────────
  const categoryData = useMemo(() => {
    const counts = {};
    allComplaints.forEach((c) => {
      const cat = c.category || c.categorySlug || 'General';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    const palette = ['#2563EB', '#3B82F6', '#60A5FA', '#93C5FD', '#1D4ED8', '#1E40AF', '#64748B'];
    return Object.entries(counts).map(([name, value], idx) => ({
      name,
      value,
      color: palette[idx % palette.length],
    }));
  }, [allComplaints]);

  // ── 2. Complaints by Pincode Chart Data ───────────────────────────────────────
  const pincodeData = useMemo(() => {
    const counts = {};
    allComplaints.forEach((c) => {
      const pin = c.pincode || 'Unknown';
      counts[pin] = (counts[pin] || 0) + 1;
    });
    return Object.entries(counts).map(([pincode, count]) => ({
      pincode: `📍 ${pincode}`,
      count,
    }));
  }, [allComplaints]);

  // ── 3. Complaints by Status Chart Data ────────────────────────────────────────
  const statusData = useMemo(() => {
    const counts = {
      Reported: 0,
      Verified: 0,
      Assigned: 0,
      'In Progress': 0,
      Resolved: 0,
    };
    allComplaints.forEach((c) => {
      if (c.status === 'open') counts.Reported += 1;
      else if (c.status === 'verified') counts.Verified += 1;
      else if (c.status === 'assigned') counts.Assigned += 1;
      else if (c.status === 'in_progress') counts['In Progress'] += 1;
      else if (c.status === 'resolved') counts.Resolved += 1;
      else counts.Reported += 1;
    });
    const colors = { Reported: '#93C5FD', Verified: '#60A5FA', Assigned: '#3B82F6', 'In Progress': '#2563EB', Resolved: '#10B981' };
    return Object.entries(counts).map(([name, count]) => ({
      name,
      count,
      fill: colors[name] || '#2563EB',
    }));
  }, [allComplaints]);

  // ── 4. Priority Distribution Chart Data ───────────────────────────────────────
  const priorityData = useMemo(() => {
    const counts = { Urgent: 0, High: 0, Medium: 0, Low: 0 };
    allComplaints.forEach((c) => {
      const p = (c.priority || 'medium').toLowerCase();
      if (p === 'urgent') counts.Urgent += 1;
      else if (p === 'high') counts.High += 1;
      else if (p === 'medium') counts.Medium += 1;
      else if (p === 'low') counts.Low += 1;
    });
    return [
      { name: 'Urgent', value: counts.Urgent, color: '#EF4444' },
      { name: 'High', value: counts.High, color: '#F59E0B' },
      { name: 'Medium', value: counts.Medium, color: '#3B82F6' },
      { name: 'Low', value: counts.Low, color: '#10B981' },
    ];
  }, [allComplaints]);

  // ── 5. Community Vote Score Analytics Data ────────────────────────────────────
  const voteScoreData = useMemo(() => {
    let totalUpvotes = 0;
    let totalDownvotes = 0;
    let totalNetScore = 0;

    const list = allComplaints.map((c) => {
      const v = getComplaintVotes(c._id, c.upvotes, c.downvotes);
      totalUpvotes += v.upvotes;
      totalDownvotes += v.downvotes;
      totalNetScore += v.netScore;
      return {
        id: `#${c._id}`,
        upvotes: v.upvotes,
        downvotes: v.downvotes,
        netScore: v.netScore,
      };
    });

    const avgNetScore = allComplaints.length > 0 ? (totalNetScore / allComplaints.length).toFixed(1) : 0;
    return { list, totalUpvotes, totalDownvotes, totalNetScore, avgNetScore };
  }, [allComplaints, getComplaintVotes]);

  // ── 6. Community Confirmation Rate Analytics Data ─────────────────────────────
  const confirmationData = useMemo(() => {
    let confirmedTotal = 0;
    let unresolvedTotal = 0;

    const list = allComplaints.map((c) => {
      const verif = getComplaintVerification(c._id);
      confirmedTotal += verif.confirmedCount;
      unresolvedTotal += verif.notConfirmedCount;
      return {
        id: `#${c._id}`,
        confirmed: verif.confirmedCount,
        unresolved: verif.notConfirmedCount,
        pct: verif.confirmationPct,
      };
    });

    const totalVotes = confirmedTotal + unresolvedTotal;
    const overallPct = totalVotes > 0 ? Math.round((confirmedTotal / totalVotes) * 100) : 0;
    return { list, confirmedTotal, unresolvedTotal, totalVotes, overallPct };
  }, [allComplaints, getComplaintVerification]);

  // ── 7. Resolution Distribution Chart Data ─────────────────────────────────────
  const resolutionData = useMemo(() => {
    const counts = {};
    allComplaints.forEach((c) => {
      const res = c.status === 'resolved' ? 'Resolved / Closed' : (c.estimatedResolution || '3–5 Days');
      counts[res] = (counts[res] || 0) + 1;
    });
    const palette = ['#10B981', '#2563EB', '#3B82F6', '#60A5FA', '#93C5FD', '#F59E0B'];
    return Object.entries(counts).map(([target, count], idx) => ({
      target,
      count,
      color: palette[idx % palette.length],
    }));
  }, [allComplaints]);

  // General KPI metrics
  const totalCount = allComplaints.length;
  const resolvedCount = allComplaints.filter((c) => c.status === 'resolved').length;
  const resolutionRatePct = totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 0;

  return (
    <div className="animate-fade-in space-y-6 w-full pb-12">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-secondary-200 rounded-xl p-5 shadow-card">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-secondary-900 tracking-tight">Municipal Analytics & Intelligence</h1>
            <span className="px-2.5 py-0.5 bg-primary-50 text-primary-700 font-extrabold text-xs rounded-full border border-primary-200">
              SHARED DATA ENGINE
            </span>
          </div>
          <p className="text-xs text-secondary-500 mt-1">
            Performance analytics, community engagement scores, and SLA distribution derived dynamically from live citizen complaints
          </p>
        </div>

        <div className="text-xs font-bold text-secondary-600 bg-secondary-50 px-3 py-1.5 rounded-lg border border-secondary-200">
          Total Sample: {totalCount} Active Grievances
        </div>
      </div>

      {/* ── KPI Summary Strip ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-secondary-200 rounded-xl p-4 shadow-card">
          <p className="text-xs font-bold text-secondary-400 uppercase tracking-wider">Total Grievances</p>
          <p className="text-2xl font-extrabold text-secondary-900 mt-1">{totalCount}</p>
          <p className="text-[11px] text-primary-700 font-semibold mt-0.5">Across all municipal wards</p>
        </div>

        <div className="bg-white border border-secondary-200 rounded-xl p-4 shadow-card">
          <p className="text-xs font-bold text-secondary-400 uppercase tracking-wider">Community Confirmation Rate</p>
          <p className="text-2xl font-extrabold text-emerald-700 mt-1">{confirmationData.overallPct}%</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">{confirmationData.confirmedTotal} confirmed citizen votes</p>
        </div>

        <div className="bg-white border border-secondary-200 rounded-xl p-4 shadow-card">
          <p className="text-xs font-bold text-secondary-400 uppercase tracking-wider">Net Community Support</p>
          <p className="text-2xl font-extrabold text-primary-700 mt-1">+{voteScoreData.totalNetScore}</p>
          <p className="text-[11px] text-secondary-500 font-semibold mt-0.5">Avg Score: +{voteScoreData.avgNetScore} / complaint</p>
        </div>

        <div className="bg-white border border-secondary-200 rounded-xl p-4 shadow-card">
          <p className="text-xs font-bold text-secondary-400 uppercase tracking-wider">Resolution Rate</p>
          <p className="text-2xl font-extrabold text-indigo-700 mt-1">{resolutionRatePct}%</p>
          <p className="text-[11px] text-indigo-600 font-semibold mt-0.5">{resolvedCount} cases closed successfully</p>
        </div>
      </div>

      {/* ── Analytics Charts Section (7 Required Analytics Visualizations) ──── */}
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
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-1">
            {categoryData.map((cat) => (
              <div key={cat.name} className="flex items-center justify-between bg-secondary-50 p-2 rounded-lg border border-secondary-100">
                <span className="flex items-center gap-1.5 text-secondary-700 font-semibold truncate">
                  <span className="w-2.5 h-2.5 rounded-full inline-block flex-shrink-0" style={{ backgroundColor: cat.color }} />
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
            <p className="text-xs text-secondary-400">Geographic distribution across active postal codes</p>
          </div>

          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={pincodeData} barSize={24}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
              <XAxis dataKey="pincode" tick={{ fontSize: 11, fill: '#4B5563' }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#4B5563' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'rgba(37,99,235,0.04)' }} />
              <Bar dataKey="count" name="Complaints" fill="#2563EB" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 3. Complaints by Status */}
        <div className="bg-white rounded-xl border border-secondary-200 shadow-card p-5 space-y-4">
          <div className="border-b border-secondary-100 pb-3">
            <h3 className="text-sm font-extrabold text-secondary-900 flex items-center gap-2">
              <BarChart2 size={16} className="text-primary-600" />
              3. Complaints by Status Stage
            </h3>
            <p className="text-xs text-secondary-400">Volume across the 5 resolution pipeline stages</p>
          </div>

          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={statusData} barSize={24}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#4B5563' }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#4B5563' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'rgba(37,99,235,0.04)' }} />
              <Bar dataKey="count" name="Grievances" radius={[6, 6, 0, 0]}>
                {statusData.map((entry, index) => (
                  <Cell key={`status-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 4. Priority Distribution */}
        <div className="bg-white rounded-xl border border-secondary-200 shadow-card p-5 space-y-4">
          <div className="border-b border-secondary-100 pb-3">
            <h3 className="text-sm font-extrabold text-secondary-900 flex items-center gap-2">
              <Flame size={16} className="text-primary-600" />
              4. Priority Level Distribution
            </h3>
            <p className="text-xs text-secondary-400">Severity classification breakdown</p>
          </div>

          <div className="h-44 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={3}
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`prio-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {priorityData.map((prio) => (
              <div key={prio.name} className="flex items-center justify-between bg-secondary-50 p-2 rounded-lg border border-secondary-100">
                <span className="flex items-center gap-1.5 text-secondary-700 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: prio.color }} />
                  {prio.name}
                </span>
                <span className="font-extrabold text-secondary-900">{prio.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Community Vote Score */}
        <div className="bg-white rounded-xl border border-secondary-200 shadow-card p-5 space-y-4">
          <div className="border-b border-secondary-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-secondary-900 flex items-center gap-2">
                <ThumbsUp size={16} className="text-primary-600" />
                5. Community Vote Score Analytics
              </h3>
              <p className="text-xs text-secondary-400">Upvotes, Downvotes, and Net Support Scores per complaint</p>
            </div>
            <span className="text-xs font-bold text-primary-700 bg-primary-50 px-2.5 py-1 rounded-lg border border-primary-200">
              Avg Net: +{voteScoreData.avgNetScore}
            </span>
          </div>

          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={voteScoreData.list} barSize={14} barGap={3}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
              <XAxis dataKey="id" tick={{ fontSize: 10, fill: '#4B5563' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#4B5563' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="upvotes" name="Upvotes (+1)" fill="#2563EB" radius={[4, 4, 0, 0]} />
              <Bar dataKey="downvotes" name="Downvotes (-1)" fill="#EF4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 6. Community Confirmation Rate */}
        <div className="bg-white rounded-xl border border-secondary-200 shadow-card p-5 space-y-4">
          <div className="border-b border-secondary-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-secondary-900 flex items-center gap-2">
                <ShieldCheck size={16} className="text-primary-600" />
                6. Community Confirmation Rate Analytics
              </h3>
              <p className="text-xs text-secondary-400">Citizen feedback validating status accuracy on field</p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              {confirmationData.overallPct}% Overall Confirmed
            </span>
          </div>

          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={confirmationData.list} barSize={16} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
              <XAxis dataKey="id" tick={{ fontSize: 10, fill: '#4B5563' }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#4B5563' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="confirmed" name="Confirmed Accurate" fill="#10B981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="unresolved" name="Flagged Unresolved" fill="#EF4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 7. Resolution Distribution */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-secondary-200 shadow-card p-5 space-y-4">
          <div className="border-b border-secondary-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-secondary-900 flex items-center gap-2">
                <Clock size={16} className="text-primary-600" />
                7. Resolution Distribution & Target ETAs
              </h3>
              <p className="text-xs text-secondary-400">Grievance allocation by target turnaround time window</p>
            </div>
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
              Target SLA Hit Rate: {resolutionRatePct}%
            </span>
          </div>

          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={resolutionData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
              <XAxis dataKey="target" tick={{ fontSize: 11, fill: '#4B5563' }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#4B5563' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'rgba(37,99,235,0.04)' }} />
              <Bar dataKey="count" name="Complaints" radius={[6, 6, 0, 0]}>
                {resolutionData.map((entry, index) => (
                  <Cell key={`res-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
}
