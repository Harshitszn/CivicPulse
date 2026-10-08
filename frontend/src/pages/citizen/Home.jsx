import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Rss, PlusCircle, MapPin, TrendingUp, CheckCircle2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import ApiClient from '../../services/api';

const EMOJI_MAP = {
  road: '🛣️',
  pothole: '🛣️',
  water: '💧',
  lighting: '💡',
  streetlight: '💡',
  sanitation: '🗑️',
  garbage: '🗑️',
  drainage: '🌊',
  sewage: '🌊',
  electricity: '⚡',
  park: '🌳',
};

export default function Home() {
  const [statsData, setStatsData] = useState({
    total: 0,
    resolved: 0,
    inProgress: 0,
    zones: 6,
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const [overview, areas] = await Promise.all([
          ApiClient.getInsightsOverview(),
          ApiClient.getAreas().catch(() => []),
        ]);
        if (!cancelled && overview) {
          setStatsData({
            total: overview.totalComplaints || 0,
            resolved: overview.resolved || 0,
            inProgress: overview.inProgress || 0,
            zones: Array.isArray(areas) && areas.length > 0 ? areas.length : 6,
          });

          const cats = overview.topCommunityPriorities?.categories || [];
          const mapped = cats.map((c) => {
            const lower = (c.category || '').toLowerCase();
            const foundKey = Object.keys(EMOJI_MAP).find((k) => lower.includes(k));
            return {
              name: c.category,
              count: c.total,
              emoji: foundKey ? EMOJI_MAP[foundKey] : '📋',
            };
          });
          setCategories(mapped);
        }
      } catch (err) {
        console.warn('Could not load dynamic home statistics:', err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = [
    { label: 'Issues Reported', value: loading ? '...' : statsData.total.toLocaleString('en-IN'), color: 'text-primary-600' },
    { label: 'Resolved', value: loading ? '...' : statsData.resolved.toLocaleString('en-IN'), color: 'text-success' },
    { label: 'In Progress', value: loading ? '...' : statsData.inProgress.toLocaleString('en-IN'), color: 'text-warning' },
    { label: 'Active Zones', value: loading ? '...' : statsData.zones.toString(), color: 'text-secondary-600' },
  ];

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="text-center py-10 px-2">
        <h1 className="text-3xl font-bold text-secondary-900 mb-3 leading-tight">
          Your city, your voice.
          <br />
          <span className="text-primary-600">Make it heard.</span>
        </h1>
        <p className="text-secondary-500 text-sm mb-6 max-w-sm mx-auto leading-relaxed">
          Report civic issues, track their resolution progress, and hold your municipality accountable — all in one place.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/report">
            <Button variant="primary" icon={PlusCircle} size="lg">
              Report an Issue
            </Button>
          </Link>
          <Link to="/feed">
            <Button variant="ghost" icon={Rss} size="lg">
              Browse Local Feed
            </Button>
          </Link>
        </div>
      </section>

      {/* Dynamic Database Stats */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
        {stats.map((s) => (
          <Card key={s.label} variant="flat" className="text-center py-4">
            <p className={`text-2xl sm:text-3xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs text-secondary-400 mt-0.5">{s.label}</p>
          </Card>
        ))}
      </section>

      {/* How it works */}
      <section className="mb-8">
        <h2 className="text-xs font-extrabold text-secondary-500 uppercase tracking-wider mb-3">How it works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            { step: '1', icon: PlusCircle, title: 'Report an issue', desc: 'Describe the problem, add a photo, and pin your location.' },
            { step: '2', icon: TrendingUp, title: 'Community upvotes', desc: 'Neighbours upvote issues to raise priority with the municipality.' },
            { step: '3', icon: MapPin, title: 'Assigned to dept.', desc: 'The system routes your complaint to the right department.' },
            { step: '4', icon: CheckCircle2, title: 'Resolved & verified', desc: 'Track real-time status and confirm resolution yourself.' },
          ].map((item) => (
            <div key={item.step} className="flex items-start gap-3.5 p-4 bg-surface rounded-xl border border-secondary-200">
              <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">{item.step}</span>
              </div>
              <div>
                <p className="text-sm font-bold text-secondary-800">{item.title}</p>
                <p className="text-xs text-secondary-500 mt-0.5 leading-snug">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Database Categories */}
      <section>
        <h2 className="text-xs font-extrabold text-secondary-500 uppercase tracking-wider mb-3">Popular categories</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
          {loading && categories.length === 0 ? (
            <div className="col-span-full py-6 text-center text-xs text-secondary-400">Loading civic categories...</div>
          ) : (
            categories.map((cat) => (
              <Link
                key={cat.name}
                to={`/feed?category=${encodeURIComponent(cat.name.toLowerCase())}`}
                className="flex items-center gap-2.5 p-3 bg-surface rounded-xl border border-secondary-200
                           hover:border-primary-300 hover:bg-primary-50 transition-all duration-fast no-underline group"
              >
                <span className="text-xl">{cat.emoji}</span>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-secondary-700 truncate group-hover:text-primary-700">
                    {cat.name}
                  </p>
                  <p className="text-[10px] text-secondary-400">{cat.count} reports</p>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
