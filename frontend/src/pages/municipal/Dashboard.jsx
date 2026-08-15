import React from 'react';
import { Link } from 'react-router-dom';
import {
  FileText, CheckCircle2, Clock, AlertTriangle, TrendingUp,
  ArrowUpRight, ArrowRight, Building2, Users,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line,
} from 'recharts';
import Card from '../../components/ui/Card';
import { StatusBadge, CategoryBadge, PriorityBadge } from '../../components/ui/Badge';

const KPI_CARDS = [
  {
    label: 'Total Complaints',
    value: '2,847',
    change: '+12% this week',
    positive: false,
    icon: FileText,
    color: 'text-primary-600',
    bg:    'bg-primary-50',
    id:    'kpi-total',
  },
  {
    label: 'Resolved',
    value: '2,134',
    change: '+8% this week',
    positive: true,
    icon: CheckCircle2,
    color: 'text-success',
    bg:    'bg-green-50',
    id:    'kpi-resolved',
  },
  {
    label: 'Pending',
    value: '421',
    change: '-3% this week',
    positive: true,
    icon: Clock,
    color: 'text-warning',
    bg:    'bg-yellow-50',
    id:    'kpi-pending',
  },
  {
    label: 'Urgent',
    value: '38',
    change: '+2 today',
    positive: false,
    icon: AlertTriangle,
    color: 'text-error',
    bg:    'bg-red-50',
    id:    'kpi-urgent',
  },
];

const WEEKLY_DATA = [
  { day: 'Mon', reported: 42, resolved: 38 },
  { day: 'Tue', reported: 55, resolved: 49 },
  { day: 'Wed', reported: 38, resolved: 42 },
  { day: 'Thu', reported: 67, resolved: 58 },
  { day: 'Fri', reported: 48, resolved: 45 },
  { day: 'Sat', reported: 29, resolved: 31 },
  { day: 'Sun', reported: 22, resolved: 25 },
];

const RECENT_COMPLAINTS = [
  { _id: '1', title: 'Pothole on MG Road', category: 'roads', status: 'in_progress', priority: 'high',    reportedAt: '30m ago' },
  { _id: '2', title: 'No water supply Sector 14', category: 'water', status: 'acknowledged', priority: 'urgent',  reportedAt: '2h ago' },
  { _id: '3', title: 'Broken street lights NH', category: 'streetlights', status: 'open', priority: 'medium', reportedAt: '5h ago' },
  { _id: '4', title: 'Garbage pile at Main Market', category: 'sanitation', status: 'open', priority: 'high',   reportedAt: '6h ago' },
  { _id: '5', title: 'Park bench broken Sector 5', category: 'parks', status: 'resolved', priority: 'low',    reportedAt: '1d ago' },
];

const DEPT_LOAD = [
  { name: 'Roads & Infrastructure', pending: 142, resolved: 389 },
  { name: 'Water Supply',           pending: 87,  resolved: 213 },
  { name: 'Electricity',            pending: 54,  resolved: 198 },
  { name: 'Sanitation',             pending: 71,  resolved: 245 },
  { name: 'Parks & Recreation',     pending: 38,  resolved: 127 },
];

export default function Dashboard() {
  return (
    <div className="animate-fade-in space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-secondary-900">Overview</h2>
          <p className="text-sm text-secondary-400 mt-0.5">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <Link to="/municipal/complaints" className="flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 font-medium no-underline">
          View all complaints <ArrowRight size={14} />
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {KPI_CARDS.map((kpi) => (
          <div key={kpi.label} id={kpi.id} className="bg-surface rounded-lg border border-secondary-200 shadow-card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 rounded-lg ${kpi.bg} flex items-center justify-center`}>
                <kpi.icon size={18} className={kpi.color} />
              </div>
              <span className={`text-xs font-medium ${kpi.positive ? 'text-success' : 'text-secondary-400'}`}>
                {kpi.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-secondary-900">{kpi.value}</p>
            <p className="text-xs text-secondary-400 mt-0.5">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Weekly chart */}
        <div className="lg:col-span-2 bg-surface rounded-lg border border-secondary-200 shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-secondary-800">Weekly Activity</h3>
            <span className="text-xs text-secondary-400">Last 7 days</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={WEEKLY_DATA} barSize={14} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                cursor={{ fill: 'rgba(37,99,235,0.04)' }}
              />
              <Bar dataKey="reported" name="Reported" fill="#BFDBFE" radius={[4, 4, 0, 0]} />
              <Bar dataKey="resolved" name="Resolved" fill="#2563EB" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-2">
            <span className="flex items-center gap-1.5 text-xs text-secondary-400">
              <span className="w-2.5 h-2.5 rounded-sm bg-blue-200 inline-block" /> Reported
            </span>
            <span className="flex items-center gap-1.5 text-xs text-secondary-400">
              <span className="w-2.5 h-2.5 rounded-sm bg-primary-600 inline-block" /> Resolved
            </span>
          </div>
        </div>

        {/* Department load */}
        <div className="bg-surface rounded-lg border border-secondary-200 shadow-card p-5">
          <h3 className="text-sm font-semibold text-secondary-800 mb-4">Department Load</h3>
          <div className="space-y-3">
            {DEPT_LOAD.map((dept) => {
              const total = dept.pending + dept.resolved;
              const pct = Math.round((dept.resolved / total) * 100);
              return (
                <div key={dept.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-secondary-600 truncate flex-1">{dept.name}</span>
                    <span className="text-xs font-semibold text-secondary-700 ml-2">{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-secondary-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-600 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-[10px] text-secondary-400 mt-0.5">{dept.pending} pending</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Complaints table */}
      <div className="bg-surface rounded-lg border border-secondary-200 shadow-card">
        <div className="flex items-center justify-between px-5 py-4 border-b border-secondary-100">
          <h3 className="text-sm font-semibold text-secondary-800">Recent Complaints</h3>
          <Link to="/municipal/complaints" className="text-xs text-primary-600 hover:text-primary-700 font-medium no-underline flex items-center gap-1">
            View all <ArrowRight size={12} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-secondary-100">
                <th className="px-5 py-3 text-left text-xs font-semibold text-secondary-400 uppercase tracking-wide">Title</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-secondary-400 uppercase tracking-wide hidden md:table-cell">Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-secondary-400 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-secondary-400 uppercase tracking-wide hidden lg:table-cell">Priority</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-secondary-400 uppercase tracking-wide hidden md:table-cell">Reported</th>
              </tr>
            </thead>
            <tbody>
              {RECENT_COMPLAINTS.map((c) => (
                <tr key={c._id} className="border-b border-secondary-50 last:border-0 hover:bg-secondary-50 transition-colors cursor-pointer">
                  <td className="px-5 py-3">
                    <Link to={`/municipal/complaints/${c._id}`} className="text-secondary-700 hover:text-primary-700 font-medium line-clamp-1 no-underline text-xs">
                      {c.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell"><CategoryBadge category={c.category} /></td>
                  <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                  <td className="px-4 py-3 hidden lg:table-cell"><PriorityBadge priority={c.priority} /></td>
                  <td className="px-4 py-3 text-xs text-secondary-400 hidden md:table-cell">{c.reportedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
