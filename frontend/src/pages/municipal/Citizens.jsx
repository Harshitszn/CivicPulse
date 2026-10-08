import React, { useState, useEffect, useCallback } from 'react';
import { Search, MapPin, FileText, CheckCircle2, Clock, Loader2, RefreshCw } from 'lucide-react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import ApiClient from '../../services/api';

export default function Citizens() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [citizens, setCitizens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchCitizens = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ApiClient.getAdminCitizens({ search: debouncedSearch.trim() || undefined });
      setCitizens(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load registered citizens:', err);
      setError(err.message || 'Failed to retrieve citizens');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    fetchCitizens();
  }, [fetchCitizens]);

  const filtered = citizens;

  return (
    <div className="animate-fade-in space-y-5 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-secondary-900">Citizens Directory</h2>
          <p className="text-sm text-secondary-400">
            {loading ? 'Querying database...' : `${filtered.length} registered citizen accounts in PostgreSQL`}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          icon={RefreshCw}
          onClick={fetchCitizens}
          loading={loading}
          className="text-xs font-bold text-secondary-600"
        >
          Refresh
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Registered', value: citizens.length, icon: '👥', color: 'bg-primary-50 text-primary-600' },
          { label: 'Active Reporters',  value: citizens.filter(c => c.total > 0).length, icon: '📋', color: 'bg-green-50 text-success' },
          { label: 'High Engagement',   value: citizens.filter(c => c.total >= 5).length, icon: '⭐', color: 'bg-yellow-50 text-warning' },
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
        placeholder="Search registered citizens by name, email, or pincode..."
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
