import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin, Layers, Filter, Eye, ArrowRight, RefreshCw, Flame, CheckCircle2, ThumbsUp, Shield
} from 'lucide-react';
import { StatusBadge, CategoryBadge, PriorityBadge } from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { usePincode } from '../../context/PincodeContext';

// Standard mock coordinates grid for prototype map canvas
const MOCK_COORDINATES = [
  { x: 34, y: 38 },
  { x: 64, y: 52 },
  { x: 44, y: 68 },
  { x: 22, y: 58 },
  { x: 74, y: 28 },
  { x: 82, y: 64 },
  { x: 28, y: 72 },
  { x: 50, y: 34 },
  { x: 58, y: 80 },
  { x: 38, y: 24 },
];

export default function MapView() {
  const { allComplaints, getComplaintVotes } = usePincode();

  // ── Filters State (4 Required Filters) ───────────────────────────────────────
  const [pincodeFilter, setPincodeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  // ── Unique Filter Options ───────────────────────────────────────────────────
  const uniquePincodes = useMemo(() => {
    return Array.from(new Set(allComplaints.map((c) => c.pincode).filter(Boolean))).sort();
  }, [allComplaints]);

  const uniqueCategories = useMemo(() => {
    return Array.from(new Set(allComplaints.map((c) => c.category || c.categorySlug).filter(Boolean))).sort();
  }, [allComplaints]);

  // ── Complaints mapped with mock coordinates & filtered ──────────────────────
  const mappedComplaints = useMemo(() => {
    return allComplaints.map((c, index) => {
      const coord = MOCK_COORDINATES[index % MOCK_COORDINATES.length];
      return {
        ...c,
        x: coord.x,
        y: coord.y,
      };
    });
  }, [allComplaints]);

  const filteredComplaints = useMemo(() => {
    return mappedComplaints.filter((c) => {
      const matchPin = pincodeFilter === 'all' || c.pincode === pincodeFilter;
      const matchCat =
        categoryFilter === 'all' ||
        (c.category && c.category.toLowerCase() === categoryFilter.toLowerCase()) ||
        (c.categorySlug && c.categorySlug.toLowerCase() === categoryFilter.toLowerCase());
      const matchPriority = priorityFilter === 'all' || c.priority === priorityFilter;
      const matchStatus = statusFilter === 'all' || c.status === statusFilter;
      return matchPin && matchCat && matchPriority && matchStatus;
    });
  }, [mappedComplaints, pincodeFilter, categoryFilter, priorityFilter, statusFilter]);

  const resetFilters = () => {
    setPincodeFilter('all');
    setCategoryFilter('all');
    setPriorityFilter('all');
    setStatusFilter('all');
  };

  const isFilterActive =
    pincodeFilter !== 'all' ||
    categoryFilter !== 'all' ||
    priorityFilter !== 'all' ||
    statusFilter !== 'all';

  return (
    <div className="animate-fade-in space-y-5 max-w-container mx-auto pb-12">
      {/* ── Title Bar ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-secondary-200 rounded-xl p-5 shadow-card">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-secondary-900 tracking-tight">Geospatial Complaint Map</h1>
            <span className="px-2.5 py-0.5 bg-primary-50 text-primary-700 font-extrabold text-xs rounded-full border border-primary-200">
              PROTOTYPE MAP DEMO
            </span>
          </div>
          <p className="text-xs text-secondary-500 mt-1">
            Visual geospatial distribution of municipal grievances across pincode zones • Interactive map pins
          </p>
        </div>

        <div className="text-xs font-bold text-secondary-600 bg-secondary-50 px-3 py-1.5 rounded-lg border border-secondary-200">
          Mapped: {filteredComplaints.length} of {allComplaints.length} Grievances
        </div>
      </div>

      {/* ── 4 Filters Bar ────────────────────────────────────────────────────── */}
      <div className="bg-white border border-secondary-200 rounded-xl p-4 space-y-3 shadow-card">
        <div className="flex items-center justify-between border-b border-secondary-100 pb-2">
          <div className="flex items-center gap-2">
            <Filter size={15} className="text-primary-600" />
            <h3 className="text-xs font-extrabold text-secondary-900 uppercase tracking-wider">Map Filters</h3>
          </div>

          {isFilterActive && (
            <button
              onClick={resetFilters}
              className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1 bg-primary-50 px-2.5 py-1 rounded-md border border-primary-200"
            >
              <RefreshCw size={12} /> Reset Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* 1. Pincode Filter */}
          <div>
            <label className="block text-[11px] font-bold text-secondary-600 uppercase tracking-wider mb-1">
              1. Pincode Zone
            </label>
            <select
              value={pincodeFilter}
              onChange={(e) => setPincodeFilter(e.target.value)}
              className="w-full bg-secondary-50 border border-secondary-200 text-secondary-900 text-xs rounded-lg p-2 font-medium focus:ring-2 focus:ring-primary-500 focus:outline-none"
            >
              <option value="all">All Pincodes</option>
              {uniquePincodes.map((pin) => (
                <option key={pin} value={pin}>📍 {pin}</option>
              ))}
            </select>
          </div>

          {/* 2. Category Filter */}
          <div>
            <label className="block text-[11px] font-bold text-secondary-600 uppercase tracking-wider mb-1">
              2. Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-secondary-50 border border-secondary-200 text-secondary-900 text-xs rounded-lg p-2 font-medium focus:ring-2 focus:ring-primary-500 focus:outline-none"
            >
              <option value="all">All Categories</option>
              {uniqueCategories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* 3. Priority Filter */}
          <div>
            <label className="block text-[11px] font-bold text-secondary-600 uppercase tracking-wider mb-1">
              3. Priority Level
            </label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full bg-secondary-50 border border-secondary-200 text-secondary-900 text-xs rounded-lg p-2 font-medium focus:ring-2 focus:ring-primary-500 focus:outline-none"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* 4. Status Filter */}
          <div>
            <label className="block text-[11px] font-bold text-secondary-600 uppercase tracking-wider mb-1">
              4. Status Pipeline
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-secondary-50 border border-secondary-200 text-secondary-900 text-xs rounded-lg p-2 font-medium focus:ring-2 focus:ring-primary-500 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="open">Reported (Open)</option>
              <option value="verified">Verified</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Main Map Canvas & Sidebar Grid ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Prototype Map Canvas */}
        <div className="lg:col-span-2 bg-white border border-secondary-200 rounded-xl shadow-card overflow-hidden">
          {/* Map Controls Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-secondary-100 bg-secondary-50">
            <div className="flex items-center gap-2 text-xs font-bold text-secondary-800">
              <Layers size={15} className="text-primary-600" />
              <span>Bengaluru Municipal District Vector Map</span>
            </div>

            <div className="flex items-center gap-3 text-[11px] font-semibold text-secondary-600">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> Urgent/High</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-primary-600 inline-block" /> In Progress</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Resolved</span>
            </div>
          </div>

          {/* Map Vector Blueprint Canvas */}
          <div
            className="relative w-full overflow-hidden select-none"
            style={{
              height: '460px',
              background: 'linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 50%, #F1F5F9 100%)',
            }}
          >
            {/* Grid Vector Lines */}
            {[...Array(10)].map((_, i) => (
              <div
                key={`v-${i}`}
                className="absolute top-0 bottom-0 border-l border-blue-200/40"
                style={{ left: `${(i + 1) * 10}%` }}
              />
            ))}
            {[...Array(8)].map((_, i) => (
              <div
                key={`h-${i}`}
                className="absolute left-0 right-0 border-t border-blue-200/40"
                style={{ top: `${(i + 1) * 12.5}%` }}
              />
            ))}

            {/* Pincode Zone Labels on Canvas */}
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-extrabold text-secondary-800 border border-secondary-200 shadow-sm flex items-center gap-1.5">
              <MapPin size={14} className="text-primary-600" />
              <span>Bengaluru Central • Pincode Zones 560001 - 560004</span>
            </div>

            {/* Render Pins for Filtered Complaints */}
            {filteredComplaints.map((c) => {
              const isUrgent = c.priority === 'urgent' || c.priority === 'high';
              const isResolved = c.status === 'resolved';
              const pinColor = isResolved
                ? 'bg-emerald-500'
                : isUrgent
                ? 'bg-red-500'
                : 'bg-primary-600';
              const isSelected = selectedComplaint?._id === c._id;

              return (
                <button
                  key={c._id}
                  onClick={() => setSelectedComplaint(isSelected ? null : c)}
                  className={`absolute transform -translate-x-1/2 -translate-y-full transition-transform hover:scale-125 focus:outline-none ${
                    isSelected ? 'scale-125 z-30' : 'z-10'
                  }`}
                  style={{ left: `${c.x}%`, top: `${c.y}%` }}
                  title={`#${c._id}: ${c.title}`}
                >
                  <div className="relative group">
                    <div className={`w-6 h-6 rounded-full border-2 border-white shadow-raised flex items-center justify-center text-[9px] font-extrabold text-white ${pinColor}`}>
                      #{c._id}
                    </div>
                    {isSelected && (
                      <div className="w-8 h-8 rounded-full border-2 border-primary-500 animate-ping absolute -top-1 -left-1 opacity-75" />
                    )}
                  </div>
                </button>
              );
            })}

            {/* ── Pin Detail Popup ──────────── */}
            {selectedComplaint && (
              <div
                className="absolute bg-white rounded-xl shadow-raised border border-secondary-200 p-4 max-w-[280px] z-40 animate-fade-in space-y-2 text-xs"
                style={{
                  left: `${Math.min(selectedComplaint.x + 2, 60)}%`,
                  top: `${Math.max(selectedComplaint.y - 25, 5)}%`,
                }}
              >
                <div className="flex items-center justify-between border-b border-secondary-100 pb-1.5">
                  <span className="font-extrabold text-primary-700">Complaint #{selectedComplaint._id}</span>
                  <button
                    onClick={() => setSelectedComplaint(null)}
                    className="text-secondary-400 hover:text-secondary-600 font-bold"
                  >
                    ✕
                  </button>
                </div>

                <p className="font-bold text-secondary-900 line-clamp-2 leading-snug">
                  {selectedComplaint.title}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  <CategoryBadge category={selectedComplaint.category || selectedComplaint.categorySlug} />
                  <StatusBadge status={selectedComplaint.status} />
                  <PriorityBadge priority={selectedComplaint.priority} />
                </div>

                <div className="flex justify-between items-center text-[11px] pt-1 text-secondary-600 border-t border-secondary-100">
                  <span className="font-mono font-bold">📍 PIN: {selectedComplaint.pincode}</span>
                  <span className="font-extrabold text-primary-700">
                    Score: {getComplaintVotes(selectedComplaint._id, selectedComplaint.upvotes, selectedComplaint.downvotes).netScore}
                  </span>
                </div>

                <Link to={`/municipal/complaints/${selectedComplaint._id}`} className="block pt-1">
                  <Button variant="primary" size="sm" className="w-full font-bold text-[11px] py-1">
                    Manage Complaint Details <ArrowRight size={12} className="ml-1" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* ── Sidebar Column (Show 6 Required Attributes per Complaint) ──────── */}
        <div className="space-y-4">
          <div className="bg-white border border-secondary-200 rounded-xl p-5 shadow-card space-y-3">
            <h3 className="text-xs font-extrabold text-secondary-900 uppercase tracking-wider border-b border-secondary-100 pb-2">
              Mapped Complaint Directory ({filteredComplaints.length})
            </h3>
            <p className="text-xs text-secondary-500">
              Click any grievance card to highlight pin coordinates on the prototype map:
            </p>

            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {filteredComplaints.length === 0 ? (
                <p className="text-xs text-secondary-400 italic text-center py-4">
                  No grievances match map filters.
                </p>
              ) : (
                filteredComplaints.map((c) => {
                  const votes = getComplaintVotes(c._id, c.upvotes, c.downvotes);
                  const isSelected = selectedComplaint?._id === c._id;

                  return (
                    <div
                      key={c._id}
                      onClick={() => setSelectedComplaint(c)}
                      className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-primary-50/80 border-primary-400 shadow-sm'
                          : 'bg-white border-secondary-200 hover:border-primary-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-extrabold text-primary-700">#{c._id}</span>
                        <div className="flex items-center gap-1">
                          <PriorityBadge priority={c.priority} />
                          <StatusBadge status={c.status} />
                        </div>
                      </div>

                      <p className="font-bold text-secondary-900 line-clamp-1 mb-1.5">
                        {c.title}
                      </p>

                      <div className="flex items-center justify-between text-[11px] text-secondary-600 font-medium">
                        <span className="flex items-center gap-1 font-mono font-bold text-secondary-700">
                          <MapPin size={12} className="text-primary-600" /> {c.pincode}
                        </span>

                        <span className="font-extrabold text-primary-700">
                          Net Score: {votes.netScore > 0 ? `+${votes.netScore}` : votes.netScore}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
