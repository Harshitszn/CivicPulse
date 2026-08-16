import React, { useState } from 'react';
import { Search, MapPin, FileText, CheckCircle2, Clock } from 'lucide-react';
import Input from '../../components/ui/Input';
import { StatusBadge } from '../../components/ui/Badge';

const CITIZENS = [
  { _id: 'u1', name: 'Priya Sharma',   email: 'priya@example.com',  pincode: '560001', ward: 'Ward 47', total: 4, resolved: 1, joinedAt: '2024-01-15' },
  { _id: 'u2', name: 'Rajesh Kumar',   email: 'rajesh@example.com', pincode: '110014', ward: 'Ward 12', total: 7, resolved: 5, joinedAt: '2024-02-08' },
  { _id: 'u3', name: 'Meena R.',       email: 'meena@example.com',  pincode: '560002', ward: 'Ward 8',  total: 2, resolved: 2, joinedAt: '2024-03-22' },
  { _id: 'u4', name: 'Arun V.',        email: 'arun@example.com',   pincode: '560003', ward: 'Ward 23', total: 5, resolved: 3, joinedAt: '2023-11-01' },
  { _id: 'u5', name: 'Sunitha M.',     email: 'sunitha@example.com',pincode: '560004', ward: 'Ward 31', total: 3, resolved: 2, joinedAt: '2024-04-17' },
  { _id: 'u6', name: 'Vikram P.',      email: 'vikram@example.com', pincode: '560001', ward: 'Ward 47', total: 9, resolved: 8, joinedAt: '2023-09-30' },
  { _id: 'u7', name: 'Deepa N.',       email: 'deepa@example.com',  pincode: '560005', ward: 'Ward 15', total: 1, resolved: 0, joinedAt: '2024-07-01' },
];

export default function Citizens() {
  const [search, setSearch] = useState('');

  const filtered = CITIZENS.filter((c) =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()) || c.pincode.includes(search)
  );

  return (
    <div className="animate-fade-in space-y-5 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-secondary-900">Citizens</h2>
          <p className="text-sm text-secondary-400">{filtered.length} registered users</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Registered', value: CITIZENS.length, icon: '👥', color: 'bg-primary-50 text-primary-600' },
          { label: 'Active Reporters',  value: CITIZENS.filter(c => c.total > 0).length, icon: '📋', color: 'bg-green-50 text-success' },
          { label: 'High Engagement',   value: CITIZENS.filter(c => c.total >= 5).length, icon: '⭐', color: 'bg-yellow-50 text-warning' },
        ].map((s) => (
          <div key={s.label} className="bg-surface border border-secondary-200 rounded-lg shadow-card p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${s.color}`}>{s.icon}</div>
            <div>
              <p className="text-xl font-bold text-secondary-900">{s.value}</p>
              <p className="text-xs text-secondary-400">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <Input
        placeholder="Search by name, email, or pincode..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        icon={Search}
        id="citizens-search"
      />

      {/* Table */}
      <div className="bg-surface border border-secondary-200 rounded-lg shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-secondary-50 border-b border-secondary-200">
                {['Citizen', 'Pincode / Ward', 'Reports', 'Resolved', 'Resolution Rate', 'Joined'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-secondary-400 text-sm">No citizens found.</td></tr>
              ) : filtered.map((c) => {
                const rate = c.total > 0 ? Math.round((c.resolved / c.total) * 100) : 0;
                return (
                  <tr key={c._id} className="border-b border-secondary-100 last:border-0 hover:bg-secondary-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-primary-700 text-xs font-bold">{c.name.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-secondary-800">{c.name}</p>
                          <p className="text-[10px] text-secondary-400">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-secondary-600">
                      <p className="font-medium">{c.pincode}</p>
                      <p className="text-secondary-400">{c.ward}</p>
                    </td>
                    <td className="px-4 py-3 text-xs font-medium text-secondary-700">{c.total}</td>
                    <td className="px-4 py-3 text-xs font-medium text-success">{c.resolved}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-secondary-100 rounded-full overflow-hidden">
                          <div className="h-full bg-primary-600 rounded-full" style={{ width: `${rate}%` }} />
                        </div>
                        <span className="text-[10px] font-medium text-secondary-600">{rate}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-secondary-400">{new Date(c.joinedAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
