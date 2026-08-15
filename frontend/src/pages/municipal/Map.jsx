import React from 'react';
import { MapPin, Layers, Filter } from 'lucide-react';
import { StatusBadge, CategoryBadge } from '../../components/ui/Badge';

const PINS = [
  { id: '1', title: 'Pothole on MG Road',        category: 'roads',        status: 'in_progress', x: 35, y: 40  },
  { id: '2', title: 'No water in Sector 14',      category: 'water',        status: 'acknowledged', x: 60, y: 55 },
  { id: '3', title: 'Broken street lights',       category: 'streetlights', status: 'open',         x: 45, y: 70 },
  { id: '4', title: 'Overflowing drainage',       category: 'drainage',     status: 'open',         x: 20, y: 60 },
  { id: '5', title: 'Garbage pile Market Road',   category: 'sanitation',   status: 'resolved',     x: 70, y: 30 },
  { id: '6', title: 'Damaged park bench',         category: 'parks',        status: 'open',         x: 80, y: 65 },
];

const STATUS_DOT = {
  open:         'bg-primary-600',
  acknowledged: 'bg-purple-500',
  in_progress:  'bg-warning',
  resolved:     'bg-success',
  rejected:     'bg-error',
};

export default function MapView() {
  const [selected, setSelected] = React.useState(null);

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-secondary-900">Map View</h2>
          <p className="text-sm text-secondary-400">Geospatial complaint distribution</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Map canvas */}
        <div className="lg:col-span-3 bg-surface border border-secondary-200 rounded-lg shadow-card overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-secondary-100">
            <Layers size={14} className="text-secondary-400" />
            <span className="text-xs font-medium text-secondary-600">Interactive Map — Bengaluru Urban District</span>
            <div className="ml-auto flex items-center gap-3">
              {['open', 'in_progress', 'resolved'].map((s) => (
                <span key={s} className="flex items-center gap-1 text-[10px] text-secondary-400">
                  <span className={`w-2 h-2 rounded-full ${STATUS_DOT[s]}`} />
                  {s.replace('_', ' ')}
                </span>
              ))}
            </div>
          </div>

          {/* Placeholder map with interactive pins */}
          <div
            className="relative w-full"
            style={{ height: '420px', background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 50%, #EFF6FF 100%)' }}
          >
            {/* Grid lines */}
            {[...Array(8)].map((_, i) => (
              <div key={`v${i}`} className="absolute top-0 bottom-0 border-l border-blue-100/60" style={{ left: `${(i + 1) * 12.5}%` }} />
            ))}
            {[...Array(6)].map((_, i) => (
              <div key={`h${i}`} className="absolute left-0 right-0 border-t border-blue-100/60" style={{ top: `${(i + 1) * 16.67}%` }} />
            ))}

            {/* City label */}
            <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-semibold text-secondary-500 border border-secondary-200">
              📍 Bengaluru Urban
            </div>

            {/* Pins */}
            {PINS.map((pin) => (
              <button
                key={pin.id}
                onClick={() => setSelected(selected?.id === pin.id ? null : pin)}
                className="absolute transform -translate-x-1/2 -translate-y-full group"
                style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                title={pin.title}
              >
                <div className={`w-5 h-5 rounded-full border-2 border-white shadow-raised transition-transform group-hover:scale-125 ${STATUS_DOT[pin.status] ?? 'bg-secondary-400'}`} />
              </button>
            ))}

            {/* Pin popup */}
            {selected && (
              <div
                className="absolute bg-white rounded-lg shadow-dialog border border-secondary-200 p-3 min-w-[200px] z-10 animate-fade-in"
                style={{ left: `${Math.min(selected.x + 2, 70)}%`, top: `${Math.max(selected.y - 18, 5)}%` }}
              >
                <p className="text-xs font-semibold text-secondary-800 mb-1.5">{selected.title}</p>
                <div className="flex gap-1.5">
                  <CategoryBadge category={selected.category} />
                  <StatusBadge status={selected.status} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-3">
          <div className="bg-surface border border-secondary-200 rounded-lg p-4">
            <h3 className="text-xs font-semibold text-secondary-500 uppercase tracking-wide mb-3">Hotspot Areas</h3>
            <div className="space-y-2.5">
              {[['Ward 47', 142, 'bg-error'], ['Ward 12', 98, 'bg-warning'], ['Ward 8', 67, 'bg-primary-400'], ['Ward 23', 54, 'bg-primary-300']].map(([ward, count, color]) => (
                <div key={ward} className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${color} flex-shrink-0`} />
                  <span className="text-xs text-secondary-600 flex-1">{ward}</span>
                  <span className="text-xs font-semibold text-secondary-700">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface border border-secondary-200 rounded-lg p-4">
            <h3 className="text-xs font-semibold text-secondary-500 uppercase tracking-wide mb-3">Active Pins</h3>
            <div className="space-y-2">
              {PINS.map((pin) => (
                <button
                  key={pin.id}
                  onClick={() => setSelected(pin)}
                  className="w-full text-left p-2 rounded hover:bg-secondary-50 transition-colors"
                >
                  <p className="text-xs text-secondary-700 line-clamp-1">{pin.title}</p>
                  <div className="flex gap-1 mt-1">
                    <StatusBadge status={pin.status} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
