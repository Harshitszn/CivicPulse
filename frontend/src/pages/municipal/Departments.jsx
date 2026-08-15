import React from 'react';
import { Building2, Users, CheckCircle2, Clock, TrendingUp } from 'lucide-react';
import Card from '../../components/ui/Card';

const DEPARTMENTS = [
  {
    id: 'd1', name: 'Roads & Infrastructure', head: 'Suresh Babu', icon: '🛣️',
    pending: 142, resolved: 389, total: 531, responseTime: '2.3 days',
    officers: 8, performance: 87,
  },
  {
    id: 'd2', name: 'Water Supply Board', head: 'Kavitha R.', icon: '💧',
    pending: 87, resolved: 213, total: 300, responseTime: '1.8 days',
    officers: 6, performance: 91,
  },
  {
    id: 'd3', name: 'Electricity Department', head: 'Rajan M.', icon: '⚡',
    pending: 54, resolved: 198, total: 252, responseTime: '1.2 days',
    officers: 5, performance: 94,
  },
  {
    id: 'd4', name: 'Sanitation & Waste Mgmt', head: 'Priya T.', icon: '🗑️',
    pending: 71, resolved: 245, total: 316, responseTime: '0.9 days',
    officers: 12, performance: 89,
  },
  {
    id: 'd5', name: 'Parks & Public Spaces', head: 'Anand K.', icon: '🌳',
    pending: 38, resolved: 127, total: 165, responseTime: '3.1 days',
    officers: 4, performance: 82,
  },
  {
    id: 'd6', name: 'Street Lighting', head: 'Vijay S.', icon: '💡',
    pending: 29, resolved: 156, total: 185, responseTime: '1.5 days',
    officers: 3, performance: 96,
  },
];

function getPerformanceColor(pct) {
  if (pct >= 90) return 'text-success';
  if (pct >= 80) return 'text-warning';
  return 'text-error';
}

export default function Departments() {
  return (
    <div className="animate-fade-in space-y-5">
      <div>
        <h2 className="text-xl font-bold text-secondary-900">Departments</h2>
        <p className="text-sm text-secondary-400">{DEPARTMENTS.length} active departments</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {DEPARTMENTS.map((dept) => (
          <div key={dept.id} className="bg-surface border border-secondary-200 rounded-lg shadow-card p-5 hover:shadow-raised transition-shadow duration-normal">
            {/* Header */}
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center text-lg flex-shrink-0">
                {dept.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-secondary-900 leading-tight">{dept.name}</h3>
                <p className="text-xs text-secondary-400 mt-0.5 flex items-center gap-1">
                  <Users size={10} /> {dept.head} · {dept.officers} officers
                </p>
              </div>
              <span className={`text-base font-bold ${getPerformanceColor(dept.performance)}`}>
                {dept.performance}%
              </span>
            </div>

            {/* Performance bar */}
            <div className="mb-4">
              <div className="flex justify-between text-[10px] text-secondary-400 mb-1">
                <span>Resolution rate</span>
                <span>{dept.resolved}/{dept.total}</span>
              </div>
              <div className="h-1.5 bg-secondary-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-600 rounded-full"
                  style={{ width: `${dept.performance}%` }}
                />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-secondary-50 rounded-lg py-2">
                <p className="text-sm font-bold text-primary-600">{dept.total}</p>
                <p className="text-[10px] text-secondary-400">Total</p>
              </div>
              <div className="bg-yellow-50 rounded-lg py-2">
                <p className="text-sm font-bold text-warning">{dept.pending}</p>
                <p className="text-[10px] text-secondary-400">Pending</p>
              </div>
              <div className="bg-green-50 rounded-lg py-2">
                <p className="text-sm font-bold text-success">{dept.resolved}</p>
                <p className="text-[10px] text-secondary-400">Resolved</p>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-secondary-100">
              <span className="text-[10px] text-secondary-400">
                ⏱ Avg. response: {dept.responseTime}
              </span>
              <button className="text-xs text-primary-600 hover:text-primary-700 font-medium transition-colors">
                View details →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
