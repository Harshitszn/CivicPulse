import React from 'react';
import { Link } from 'react-router-dom';
import { Rss, PlusCircle, MapPin, TrendingUp, Shield, CheckCircle2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

const STATS = [
  { label: 'Issues Reported', value: '2,847', color: 'text-primary-600' },
  { label: 'Resolved',        value: '2,134', color: 'text-success'     },
  { label: 'In Progress',     value: '421',   color: 'text-warning'     },
  { label: 'Cities Active',   value: '18',    color: 'text-secondary-600'},
];

const RECENT_CATEGORIES = [
  { name: 'Roads & Potholes',  count: 342, emoji: '🛣️'  },
  { name: 'Water Supply',      count: 218, emoji: '💧'  },
  { name: 'Streetlights',      count: 195, emoji: '💡'  },
  { name: 'Sanitation',        count: 184, emoji: '🗑️'  },
  { name: 'Parks & Spaces',    count: 127, emoji: '🌳'  },
  { name: 'Electricity',       count: 103, emoji: '⚡'  },
];

export default function Home() {
  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="text-center py-10 px-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-semibold mb-4">
          <Shield size={12} />
          Smart India Hackathon — SIH 2024
        </div>
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

      {/* Stats */}
      <section className="grid grid-cols-2 gap-3 mb-6">
        {STATS.map((s) => (
          <Card key={s.label} variant="flat" className="text-center py-4">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-secondary-400 mt-0.5">{s.label}</p>
          </Card>
        ))}
      </section>

      {/* How it works */}
      <section className="mb-6">
        <h2 className="text-sm font-semibold text-secondary-500 uppercase tracking-wide mb-3">How it works</h2>
        <div className="space-y-3">
          {[
            { step: '1', icon: PlusCircle, title: 'Report an issue', desc: 'Describe the problem, add a photo, and pin your location.' },
            { step: '2', icon: TrendingUp, title: 'Community upvotes', desc: 'Neighbours upvote issues to raise priority with the municipality.' },
            { step: '3', icon: MapPin,     title: 'Assigned to dept.',  desc: 'The system routes your complaint to the right department.' },
            { step: '4', icon: CheckCircle2,title: 'Resolved & verified', desc: 'Track real-time status and confirm resolution yourself.' },
          ].map((item) => (
            <div key={item.step} className="flex items-start gap-4 p-4 bg-surface rounded-lg border border-secondary-200">
              <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">{item.step}</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-secondary-800">{item.title}</p>
                <p className="text-xs text-secondary-400 mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section>
        <h2 className="text-sm font-semibold text-secondary-500 uppercase tracking-wide mb-3">Popular categories</h2>
        <div className="grid grid-cols-2 gap-2">
          {RECENT_CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              to={`/feed?category=${cat.name.toLowerCase().split(' ')[0]}`}
              className="flex items-center gap-2.5 p-3 bg-surface rounded-lg border border-secondary-200
                         hover:border-primary-300 hover:bg-primary-50 transition-all duration-fast no-underline group"
            >
              <span className="text-lg">{cat.emoji}</span>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-secondary-700 truncate group-hover:text-primary-700">
                  {cat.name}
                </p>
                <p className="text-[10px] text-secondary-400">{cat.count} reports</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
