import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2, Users, CheckCircle2, Clock, AlertTriangle, Flame,
  ArrowRight, ChevronRight, Layers, MapPin, Eye, Filter
} from 'lucide-react';
import { StatusBadge, CategoryBadge, PriorityBadge } from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { usePincode } from '../../context/PincodeContext';

const MUNICIPAL_DEPARTMENTS = [
  {
    id: 'pwd',
    name: 'Public Works Department',
    icon: '🛣️',
    description: 'Road resurfacing, pothole repairs, footpaths & civil public infrastructure',
    matchKeys: ['public works department', 'roads', 'infrastructure', 'infra'],
  },
  {
    id: 'sanitation',
    name: 'Sanitation Department',
    icon: '🗑️',
    description: 'Solid waste management, garbage dump clearing & street sanitation',
    matchKeys: ['sanitation', 'garbage', 'solid waste'],
  },
  {
    id: 'water',
    name: 'Water Department',
    icon: '💧',
    description: 'Clean drinking water distribution, pipeline repairs & water supply board',
    matchKeys: ['water', 'water supply'],
  },
  {
    id: 'drainage',
    name: 'Drainage Department',
    icon: '🏞️',
    description: 'Stormwater drains, sewer overflow clearing & manhole safety',
    matchKeys: ['drainage', 'stormwater', 'sewage'],
  },
  {
    id: 'electrical',
    name: 'Electrical Department',
    icon: '💡',
    description: 'Public street lighting, transformer repairs & electrical corridors',
    matchKeys: ['electricity', 'electrical', 'street lighting', 'streetlights', 'lighting'],
  },
];

export default function Departments() {
  const { allComplaints, getComplaintVotes } = usePincode();
  const [selectedDeptId, setSelectedDeptId] = useState('pwd');

  // Dynamic calculations derived strictly from shared complaint data
  const deptStats = useMemo(() => {
    return MUNICIPAL_DEPARTMENTS.map((dept) => {
      const deptComplaints = allComplaints.filter((c) => {
        const dName = (c.department || '').toLowerCase();
        const cCat = (c.category || '').toLowerCase();
        const cSlug = (c.categorySlug || '').toLowerCase();
        return dept.matchKeys.some((k) => dName.includes(k) || cCat.includes(k) || cSlug.includes(k));
      });

      const openCount = deptComplaints.filter(
        (c) => c.status === 'open' || c.status === 'reported' || c.status === 'verified'
      ).length;

      const highPriorityCount = deptComplaints.filter(
        (c) => (c.priority || '').toLowerCase() === 'high' || (c.priority || '').toLowerCase() === 'urgent'
      ).length;

      const inProgressCount = deptComplaints.filter(
        (c) => c.status === 'in_progress' || c.status === 'assigned'
      ).length;

      const resolvedCount = deptComplaints.filter(
        (c) => c.status === 'resolved' || c.status === 'closed'
      ).length;

      const totalCount = deptComplaints.length;

      return {
        ...dept,
        complaints: deptComplaints,
        openCount,
        highPriorityCount,
        inProgressCount,
        resolvedCount,
        totalCount,
      };
    });
  }, [allComplaints]);

  // Currently active selected department for details table view
  const activeDept = useMemo(() => {
    return deptStats.find((d) => d.id === selectedDeptId) || deptStats[0];
  }, [deptStats, selectedDeptId]);

  return (
    <div className="animate-fade-in space-y-5 w-full pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-secondary-200 rounded-xl p-5 shadow-card">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-secondary-900 tracking-tight">Municipal Department Directory</h1>
            <span className="px-2.5 py-0.5 bg-primary-50 text-primary-700 font-extrabold text-xs rounded-full border border-primary-200">
              5 EXECUTIVE DEPARTMENTS
            </span>
          </div>
          <p className="text-xs text-secondary-500 mt-1">
            Departmental grievance dispatch, workload analytics, and active complaint assignment
          </p>
        </div>

        <div className="text-xs font-bold text-secondary-600 bg-secondary-50 px-3 py-1.5 rounded-lg border border-secondary-200">
          Total Shared Dataset: {allComplaints.length} Complaints
        </div>
      </div>

      {/* ── 5 Department Cards Grid ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
        {deptStats.map((dept) => {
          const isSelected = dept.id === selectedDeptId;
          return (
            <div
              key={dept.id}
              onClick={() => setSelectedDeptId(dept.id)}
              className={`bg-white border rounded-xl p-4 shadow-card hover:shadow-raised transition-all cursor-pointer space-y-3 ${
                isSelected ? 'ring-2 ring-primary-600 border-primary-600 bg-primary-50/20' : 'border-secondary-200'
              }`}
            >
              {/* Dept Icon & Name */}
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-primary-50 border border-primary-100 flex items-center justify-center text-lg flex-shrink-0">
                  {dept.icon}
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs font-extrabold text-secondary-900 truncate leading-tight">{dept.name}</h3>
                  <span className="text-[10px] text-secondary-400 font-semibold">{dept.totalCount} Assigned Cases</span>
                </div>
              </div>

              {/* 4 Required Department Statistics */}
              <div className="grid grid-cols-2 gap-2 text-center pt-1 text-xs">
                {/* 1. Open Complaints */}
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-2">
                  <p className="text-base font-extrabold text-primary-700">{dept.openCount}</p>
                  <p className="text-[9px] font-bold text-primary-600 uppercase">Open</p>
                </div>

                {/* 2. High Priority */}
                <div className="bg-red-50 border border-red-100 rounded-lg p-2">
                  <p className="text-base font-extrabold text-red-700">{dept.highPriorityCount}</p>
                  <p className="text-[9px] font-bold text-red-600 uppercase">High Priority</p>
                </div>

                {/* 3. In Progress */}
                <div className="bg-amber-50 border border-amber-100 rounded-lg p-2">
                  <p className="text-base font-extrabold text-amber-700">{dept.inProgressCount}</p>
                  <p className="text-[9px] font-bold text-amber-600 uppercase">In Progress</p>
                </div>

                {/* 4. Resolved */}
                <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-2">
                  <p className="text-base font-extrabold text-emerald-700">{dept.resolvedCount}</p>
                  <p className="text-[9px] font-bold text-emerald-600 uppercase">Resolved</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] font-bold pt-1 text-primary-600 border-t border-secondary-100">
                <span>View Assigned ({dept.totalCount})</span>
                <ChevronRight size={14} />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Active Department Complaints Section ───────────────────────────── */}
      <div className="bg-white rounded-xl border border-secondary-200 shadow-card overflow-hidden space-y-4">
        {/* Department Detail Banner */}
        <div className="p-5 border-b border-secondary-100 bg-secondary-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-600 text-white flex items-center justify-center text-xl shadow-xs">
              {activeDept.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-secondary-900">{activeDept.name}</h2>
                <span className="px-2.5 py-0.5 bg-primary-50 text-primary-700 font-extrabold text-xs rounded-full border border-primary-200">
                  {activeDept.totalCount} Active Grievances
                </span>
              </div>
              <p className="text-xs text-secondary-500 mt-0.5">{activeDept.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-bold">
            <span className="px-2.5 py-1 bg-blue-50 text-primary-700 rounded-lg border border-blue-200">
              Open: {activeDept.openCount}
            </span>
            <span className="px-2.5 py-1 bg-red-50 text-red-700 rounded-lg border border-red-200">
              High Priority: {activeDept.highPriorityCount}
            </span>
            <span className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg border border-amber-200">
              In Progress: {activeDept.inProgressCount}
            </span>
            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200">
              Resolved: {activeDept.resolvedCount}
            </span>
          </div>
        </div>

        {/* Complaints Directory Table for Active Department */}
        <div className="overflow-x-auto p-5 pt-0">
          <h3 className="text-xs font-extrabold text-secondary-900 uppercase tracking-wider mb-3">
            Assigned Department Complaints Table
          </h3>

          <table className="w-full text-xs">
            <thead>
              <tr className="bg-secondary-50 border-b border-secondary-200">
                <th className="px-3 py-3 text-left font-bold text-secondary-500 uppercase tracking-wider">ID</th>
                <th className="px-4 py-3 text-left font-bold text-secondary-500 uppercase tracking-wider">Issue Title</th>
                <th className="px-3 py-3 text-left font-bold text-secondary-500 uppercase tracking-wider">Category</th>
                <th className="px-3 py-3 text-left font-bold text-secondary-500 uppercase tracking-wider">Status</th>
                <th className="px-3 py-3 text-left font-bold text-secondary-500 uppercase tracking-wider">Priority</th>
                <th className="px-3 py-3 text-left font-bold text-secondary-500 uppercase tracking-wider">Pincode</th>
                <th className="px-3 py-3 text-center font-bold text-secondary-500 uppercase tracking-wider">Vote Score</th>
                <th className="px-3 py-3 text-right font-bold text-secondary-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody>
              {activeDept.complaints.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-secondary-500 font-medium">
                    No complaints currently assigned to this department.
                  </td>
                </tr>
              ) : (
                activeDept.complaints.map((c) => {
                  const votes = getComplaintVotes(c._id, c.upvotes, c.downvotes);
                  return (
                    <tr
                      key={c._id}
                      className="border-b border-secondary-100 last:border-0 hover:bg-secondary-50 transition-colors"
                    >
                      <td className="px-3 py-3 font-extrabold text-primary-700">#{c._id}</td>
                      <td className="px-4 py-3">
                        <Link
                          to={`/municipal/complaints/${c._id}`}
                          className="text-secondary-900 font-bold hover:text-primary-600 no-underline line-clamp-1 max-w-sm block"
                        >
                          {c.title}
                        </Link>
                      </td>
                      <td className="px-3 py-3"><CategoryBadge category={c.category || c.categorySlug} /></td>
                      <td className="px-3 py-3"><StatusBadge status={c.status} /></td>
                      <td className="px-3 py-3"><PriorityBadge priority={c.priority} /></td>
                      <td className="px-3 py-3 font-mono font-bold text-secondary-600">📍 {c.pincode}</td>
                      <td className="px-3 py-3 text-center font-extrabold">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] ${votes.netScore > 0 ? 'bg-primary-50 text-primary-700 border border-primary-200' : 'bg-secondary-100 text-secondary-600'}`}>
                          {votes.netScore > 0 ? `+${votes.netScore}` : votes.netScore}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right">
                        <Link to={`/municipal/complaints/${c._id}`}>
                          <Button variant="primary" size="sm" className="font-bold text-[11px] py-1 px-2.5">
                            Open Complaint <ArrowRight size={12} className="ml-1" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
