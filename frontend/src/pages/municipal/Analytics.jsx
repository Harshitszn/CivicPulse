import React, { useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const MONTHLY = [
  { month: 'Feb', reported: 210, resolved: 185 },
  { month: 'Mar', reported: 245, resolved: 218 },
  { month: 'Apr', reported: 198, resolved: 201 },
  { month: 'May', reported: 312, resolved: 276 },
  { month: 'Jun', reported: 289, resolved: 265 },
  { month: 'Jul', reported: 334, resolved: 298 },
];

const CATEGORY_DIST = [
  { name: 'Roads',        value: 342, color: '#2563EB' },
  { name: 'Water',        value: 218, color: '#0EA5E9' },
  { name: 'Electricity',  value: 176, color: '#F59E0B' },
  { name: 'Sanitation',   value: 195, color: '#16A34A' },
  { name: 'Parks',        value: 127, color: '#8B5CF6' },
  { name: 'Others',       value: 142, color: '#6B7280' },
];

const RESOLUTION_TREND = [
  { month: 'Feb', rate: 88 }, { month: 'Mar', rate: 89 },
  { month: 'Apr', rate: 91 }, { month: 'May', rate: 88 },
  { month: 'Jun', rate: 92 }, { month: 'Jul', rate: 89 },
];

const KPI = [
  { label: 'Avg Resolution Time', value: '2.1 days',  sub: '-0.3d vs last month', positive: true  },
  { label: 'Resolution Rate',     value: '89.2%',     sub: '+1.4% vs last month', positive: true  },
  { label: 'Reopened Issues',     value: '23',        sub: '+5 vs last month',    positive: false },
  { label: 'Citizen Satisfaction',value: '4.3 / 5',  sub: '+0.2 vs last month',  positive: true  },
];

const TOOLTIP_STYLE = {
  borderRadius: 8,
  border: '1px solid #E5E7EB',
  fontSize: 12,
  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
};

export default function Analytics() {
  return (
    <div className="animate-fade-in space-y-5">
      <div>
        <h2 className="text-xl font-bold text-secondary-900">Analytics</h2>
        <p className="text-sm text-secondary-400">Performance insights — last 6 months</p>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {KPI.map((k) => (
          <div key={k.label} className="bg-surface border border-secondary-200 rounded-lg shadow-card p-4">
            <p className="text-2xl font-bold text-secondary-900">{k.value}</p>
            <p className="text-xs text-secondary-400 mt-0.5">{k.label}</p>
            <p className={`text-xs font-medium mt-1 ${k.positive ? 'text-success' : 'text-error'}`}>{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Monthly bar */}
        <div className="lg:col-span-2 bg-surface border border-secondary-200 rounded-lg shadow-card p-5">
          <div className="flex justify-between mb-4">
            <h3 className="text-sm font-semibold text-secondary-800">Monthly Reported vs Resolved</h3>
            <span className="text-xs text-secondary-400">6 months</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={MONTHLY} barSize={18} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'rgba(37,99,235,0.04)' }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="reported" name="Reported" fill="#BFDBFE" radius={[4,4,0,0]} />
              <Bar dataKey="resolved" name="Resolved" fill="#2563EB" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category pie */}
        <div className="bg-surface border border-secondary-200 rounded-lg shadow-card p-5">
          <h3 className="text-sm font-semibold text-secondary-800 mb-4">Category Distribution</h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={CATEGORY_DIST} dataKey="value" cx="50%" cy="50%" outerRadius={65} innerRadius={35} paddingAngle={2}>
                {CATEGORY_DIST.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={TOOLTIP_STYLE} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {CATEGORY_DIST.map((c) => (
              <div key={c.name} className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs text-secondary-600">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: c.color }} />
                  {c.name}
                </span>
                <span className="text-xs font-medium text-secondary-700">{c.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Resolution rate trend */}
      <div className="bg-surface border border-secondary-200 rounded-lg shadow-card p-5">
        <div className="flex justify-between mb-4">
          <h3 className="text-sm font-semibold text-secondary-800">Resolution Rate Trend (%)</h3>
          <span className="text-xs text-secondary-400">6-month trend</span>
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={RESOLUTION_TREND}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
            <YAxis domain={[80, 100]} tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [`${v}%`, 'Resolution Rate']} />
            <Line
              type="monotone" dataKey="rate" stroke="#2563EB" strokeWidth={2.5}
              dot={{ fill: '#2563EB', r: 4, strokeWidth: 0 }}
              activeDot={{ r: 6, fill: '#1D4ED8' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
