import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Clock, User, Building2, CheckCircle2, AlertTriangle,
  ShieldCheck, ThumbsUp, ThumbsDown, Sparkles, MessageCircle, Send, Shield,
  Calendar, Layers, Sliders, Check, Loader2, Lock
} from 'lucide-react';
import { StatusBadge, CategoryBadge, PriorityBadge } from '../../components/ui/Badge';
import StatusTimeline from '../../components/ui/StatusTimeline';
import Button from '../../components/ui/Button';
import { Select, Textarea } from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { useToast } from '../../context/ToastContext';
import ApiClient from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const DEPARTMENTS_LIST = [
  'Public Works Department',
  'City Water Supply Board',
  'Sanitation & Solid Waste Management',
  'Stormwater Drainage Department',
  'Electricity & Public Lighting Department',
  'Traffic Infrastructure Department',
  'Parks & Horticulture Department',
  'General Municipal Administration',
];

const RESOLUTION_TARGETS = [
  '24 Hours',
  '1–2 Days',
  '3–5 Days',
  '7 Days',
  '10 Days',
  'Resolved / Closed',
];

function timeAgo(dateString) {
  if (!dateString) return 'Just now';
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
}

export default function MunicipalComplaintDetail() {
  const { id } = useParams();
  const { toast } = useToast();
  const { currentUser, login } = useAuth();
  const isStaffOrAdmin = currentUser && ['official', 'staff', 'admin'].includes(currentUser.role);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [complaintData, setComplaintData] = useState(null);

  // Form states
  const [selectedStatus, setSelectedStatus] = useState('REPORTED');
  const [selectedDepartment, setSelectedDepartment] = useState('Public Works Department');
  const [selectedPriority, setSelectedPriority] = useState('medium');
  const [selectedResolution, setSelectedResolution] = useState('3–5 Days');
  const [officerNote, setOfficerNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [officerCommentText, setOfficerCommentText] = useState('');
  const [postingComment, setPostingComment] = useState(false);
  const [quickLoginLoading, setQuickLoginLoading] = useState(false);

  // Fetch complaint from PostgreSQL
  const fetchComplaintDetail = useCallback(async () => {
    if (!id || !isStaffOrAdmin) return;
    setLoading(true);
    setError(null);
    try {
      const data = await ApiClient.getAdminComplaint(id);
      setComplaintData(data);
      const c = data.complaint;
      if (c) {
        setSelectedStatus(c.status || 'REPORTED');
        setSelectedDepartment(c.assigned_department || c.department || 'Public Works Department');
        setSelectedPriority(c.priority || 'medium');
      }
    } catch (err) {
      console.error('Failed to load complaint detail:', err);
      setError(err.message || 'Failed to retrieve complaint from database.');
    } finally {
      setLoading(false);
    }
  }, [id, isStaffOrAdmin]);

  useEffect(() => {
    fetchComplaintDetail();
  }, [fetchComplaintDetail]);

  const complaint = complaintData?.complaint;
  const statusHistory = complaintData?.statusHistory || [];
  const comments = complaintData?.comments || [];
  const verification = complaintData?.verification || { confirmed: 0, disputed: 0, total: 0 };

  // Apply status update
  const handleApplyOfficerControls = async () => {
    if (!complaint) return;
    setSaving(true);
    try {
      await ApiClient.updateAdminComplaintStatus(complaint.id, {
        status: selectedStatus.toUpperCase(),
        notes: officerNote.trim() || undefined,
        assigned_department: selectedDepartment,
      });

      toast.success('Status updated successfully in PostgreSQL.');
      setSaveSuccess(true);
      setModalOpen(false);
      setOfficerNote('');
      setTimeout(() => setSaveSuccess(false), 3000);
      await fetchComplaintDetail();
    } catch (err) {
      console.error('Failed to update status:', err);
      toast.error(err.message || 'Failed to update complaint status');
    } finally {
      setSaving(false);
    }
  };

  // Officer direct reply to comments
  const handleOfficerCommentSubmit = async (e) => {
    e.preventDefault();
    if (!officerCommentText.trim() || !complaint) return;

    setPostingComment(true);
    try {
      await ApiClient.addComment(complaint.id, {
        content: officerCommentText.trim(),
        isOfficialUpdate: true,
      });
      setOfficerCommentText('');
      toast.success('Official update published.');
      await fetchComplaintDetail();
    } catch (err) {
      console.error('Failed to post comment:', err);
      toast.error(err.message || 'Failed to post update');
    } finally {
      setPostingComment(false);
    }
  };

  const handleQuickDemoLogin = async (email) => {
    setQuickLoginLoading(true);
    try {
      await login({ email, password: 'password123' });
    } catch (err) {
      console.error('Quick login failed:', err);
    } finally {
      setQuickLoginLoading(false);
    }
  };

  if (!isStaffOrAdmin) {
    return (
      <div className="animate-fade-in space-y-6 w-full max-w-4xl mx-auto py-12">
        <div className="bg-white border-2 border-primary-200 rounded-2xl p-8 shadow-raised text-center space-y-6">
          <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto text-primary-600">
            <Lock size={32} />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-black text-secondary-900 tracking-tight">
              Administrative Authentication Required
            </h1>
            <p className="text-sm text-secondary-600 max-w-lg mx-auto">
              Only verified municipal officials and administrators can inspect and update complaint status records.
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/municipal/login">
              <Button variant="primary" size="lg" icon={Shield} className="font-bold text-sm">
                Sign In to Official Account
              </Button>
            </Link>

            <Button
              variant="secondary"
              size="lg"
              loading={quickLoginLoading}
              onClick={() => handleQuickDemoLogin('officer.verma@ndmc.gov.in')}
              className="text-xs font-bold"
            >
              Demo: Quick Sign In as Officer Verma
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (loading && !complaint) {
    return (
      <div className="py-24 text-center">
        <Loader2 size={32} className="animate-spin text-primary-600 mx-auto mb-3" />
        <p className="text-sm font-bold text-secondary-600">Retrieving complaint record from PostgreSQL...</p>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="p-8 max-w-xl mx-auto bg-white border border-red-200 rounded-xl text-center space-y-4">
        <AlertTriangle size={32} className="text-red-500 mx-auto" />
        <h2 className="text-base font-extrabold text-secondary-900">Complaint Not Found</h2>
        <p className="text-xs text-secondary-500">{error || 'No matching complaint found in the database.'}</p>
        <Link to="/municipal/complaints">
          <Button variant="outline" size="sm">Back to Complaints Directory</Button>
        </Link>
      </div>
    );
  }

  const netScore = (complaint.upvotes_count || 0) - (complaint.downvotes_count || 0);
  const totalVerif = verification.total || 0;
  const verifPct = totalVerif > 0 ? Math.round((verification.confirmed / totalVerif) * 100) : 0;

  return (
    <div className="animate-fade-in space-y-6 w-full pb-12">
      {/* ── Header Navigation Bar ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-secondary-200 rounded-xl p-5 shadow-card">
        <div className="flex items-center gap-3">
          <Link
            to="/municipal/complaints"
            className="p-2 rounded-lg border border-secondary-200 text-secondary-600 hover:bg-secondary-100 transition-colors no-underline"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-primary-700 text-sm">#{String(complaint.id).slice(0, 8)}</span>
              <StatusBadge status={complaint.status} />
              <PriorityBadge priority={complaint.priority} />
              {complaint.flagged_for_review && (
                <span className="px-2 py-0.5 bg-red-100 text-red-700 font-extrabold text-[10px] rounded-full border border-red-200">
                  ⚠ Flagged for Review
                </span>
              )}
            </div>
            <h1 className="text-lg font-extrabold text-secondary-900 leading-snug mt-0.5">
              {complaint.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setModalOpen(true)}
            icon={Sliders}
            className="font-bold text-xs"
          >
            Update Municipal Status
          </Button>

          {saveSuccess && (
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 animate-fade-in">
              <CheckCircle2 size={14} /> Status synchronized
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Main Left Column (Complaint Details + AI + Timeline + Comments) ── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Visual Complaint Post Card */}
          <div className="bg-white border border-secondary-200 rounded-xl overflow-hidden shadow-card">
            {/* Image Preview */}
            {complaint.image_url && (
              <div className="relative bg-secondary-900 aspect-video overflow-hidden border-b border-secondary-200">
                <img
                  src={complaint.image_url}
                  alt={complaint.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-bold flex items-center gap-1.5 border border-white/20">
                  <MapPin size={13} className="text-primary-400" />
                  PIN: {complaint.pincode}
                </div>
              </div>
            )}

            <div className="p-5 space-y-4">
              {/* Category & Metadata */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-secondary-100 pb-3">
                <div className="flex items-center gap-2">
                  <CategoryBadge category={complaint.category} />
                  <span className="text-xs text-secondary-400">• Reported {timeAgo(complaint.created_at)}</span>
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold text-secondary-700">
                  <User size={14} className="text-secondary-400" />
                  <span>Citizen ID: #{String(complaint.user_id || 'resident').slice(0, 8)}</span>
                </div>
              </div>

              {/* Full Description */}
              <div>
                <h3 className="text-xs font-bold text-secondary-400 uppercase tracking-wider mb-1">Detailed Description</h3>
                <p className="text-xs text-secondary-700 leading-relaxed whitespace-pre-line font-medium">
                  {complaint.description}
                </p>
              </div>
            </div>
          </div>

          {/* ── Status Progression Stepper ─────────────────────────────────── */}
          <div className="bg-white border border-secondary-200 rounded-xl p-5 shadow-card space-y-4">
            <h3 className="text-xs font-extrabold text-secondary-900 uppercase tracking-wider border-b border-secondary-100 pb-2">
              Municipal Resolution Timeline Stage
            </h3>
            <StatusTimeline currentStatus={complaint.status} layout="vertical" />

            {/* Status History Audit Log from DB */}
            {statusHistory.length > 0 && (
              <div className="pt-4 border-t border-secondary-100">
                <h4 className="text-xs font-bold text-secondary-500 uppercase tracking-wider mb-2">
                  Status Change Audit Log ({statusHistory.length} events)
                </h4>
                <div className="space-y-2">
                  {statusHistory.map((h, i) => (
                    <div key={h.id || i} className="text-xs bg-secondary-50 rounded-lg p-2.5 border border-secondary-100 flex items-start justify-between">
                      <div>
                        <span className="font-bold text-secondary-900">{h.from_status || 'INITIAL'} → {h.to_status}</span>
                        {h.notes && <p className="text-secondary-600 mt-0.5">{h.notes}</p>}
                        <span className="text-[10px] text-secondary-400">By {h.changed_by_name || 'Staff Official'}</span>
                      </div>
                      <span className="text-[10px] text-secondary-400 whitespace-nowrap">{timeAgo(h.created_at)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Citizen Status Verification Panel ────────────────────────────── */}
          <div className="bg-white border border-secondary-200 rounded-xl p-5 shadow-card space-y-3">
            <div className="flex items-center justify-between border-b border-secondary-100 pb-3">
              <h3 className="text-xs font-bold text-secondary-900 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-primary-600" />
                Community Confirmation & Verification Stats
              </h3>

              {totalVerif > 0 ? (
                <span className="text-xs font-extrabold text-primary-700 bg-primary-50 px-2.5 py-1 rounded-lg border border-primary-200">
                  {verifPct}% Confirmed
                </span>
              ) : (
                <span className="text-[11px] font-medium text-secondary-400">Pending Resident Responses</span>
              )}
            </div>

            <p className="text-xs text-secondary-600">
              Citizens in pincode <strong>{complaint.pincode}</strong> vote on whether the municipal status accurately reflects field reality:
            </p>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-center">
                <p className="text-xl font-extrabold text-emerald-800 flex items-center justify-center gap-1.5">
                  <ThumbsUp size={18} /> {verification.confirmed}
                </p>
                <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mt-0.5">Yes, Confirmed</p>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                <p className="text-xl font-extrabold text-red-800 flex items-center justify-center gap-1.5">
                  <ThumbsDown size={18} /> {verification.disputed}
                </p>
                <p className="text-[10px] font-bold text-red-700 uppercase tracking-wider mt-0.5">No, Unresolved</p>
              </div>
            </div>
          </div>

          {/* ── Comments & Official Updates Discussion Feed ─────────────────── */}
          <div className="bg-white border border-secondary-200 rounded-xl p-5 shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-secondary-100 pb-3">
              <h3 className="text-xs font-extrabold text-secondary-900 uppercase tracking-wider flex items-center gap-2">
                <MessageCircle size={16} className="text-primary-600" />
                Community Discussion & Official Notes ({comments.length})
              </h3>
            </div>

            {/* Officer Direct Response Composer */}
            <form onSubmit={handleOfficerCommentSubmit} className="space-y-2 bg-primary-50/60 border border-primary-200 rounded-xl p-3.5">
              <div className="flex items-center gap-2 text-xs font-bold text-primary-800">
                <Shield size={14} className="text-primary-600" />
                <span>Post Official Officer Update to Discussion</span>
              </div>
              <textarea
                value={officerCommentText}
                onChange={(e) => setOfficerCommentText(e.target.value)}
                placeholder="Post work order update, site inspection notice, or field dispatch status for residents..."
                rows={2}
                className="w-full bg-white border border-secondary-200 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-primary-500 focus:outline-none text-secondary-900"
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  loading={postingComment}
                  icon={Send}
                  className="font-bold text-xs"
                >
                  Post Official Update
                </Button>
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-3 pt-2">
              {comments.length === 0 ? (
                <div className="flex flex-col items-center py-10 text-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-secondary-100 flex items-center justify-center mb-1">
                    <MessageCircle size={22} className="text-secondary-400" />
                  </div>
                  <p className="text-sm font-bold text-secondary-500">No discussion yet</p>
                  <p className="text-xs text-secondary-400 max-w-[200px]">Post an official update above to start the thread for citizens.</p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div
                    key={comment.id}
                    className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                      comment.is_official
                        ? 'bg-primary-50/80 border-primary-200'
                        : 'bg-secondary-50 border-secondary-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-secondary-900">
                          {comment.author?.name || 'Resident'}
                        </span>
                        {comment.is_official && (
                          <span className="px-2 py-0.5 bg-primary-600 text-white font-extrabold text-[9px] rounded-full uppercase tracking-wider">
                            OFFICIAL OFFICER UPDATE
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-secondary-400 font-medium">
                        {timeAgo(comment.created_at)}
                      </span>
                    </div>

                    <p className="text-secondary-800 leading-relaxed font-medium">
                      {comment.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ── Sidebar Right Column (Officer Controls Panel + Metadata) ──────── */}
        <div className="space-y-5">
          {/* ── Officer Quick Control Box ──────────────────────────────────── */}
          <div className="bg-white border-2 border-primary-300 rounded-xl p-5 shadow-card space-y-4">
            <div className="flex items-center gap-2 border-b border-secondary-100 pb-3">
              <Sliders size={18} className="text-primary-600" />
              <div>
                <h3 className="text-sm font-extrabold text-secondary-900">Officer Controls</h3>
                <p className="text-[11px] text-secondary-500">Update parameters live in PostgreSQL</p>
              </div>
            </div>

            <div className="space-y-3.5">
              {/* Control 1: Change Status */}
              <div>
                <label className="block text-xs font-bold text-secondary-700 mb-1">
                  1. Change Status Stage
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full bg-secondary-50 border border-secondary-200 text-secondary-900 text-xs rounded-lg p-2.5 font-bold focus:ring-2 focus:ring-primary-500 focus:outline-none"
                >
                  <option value="REPORTED">Reported (Open)</option>
                  <option value="VERIFIED">Verified</option>
                  <option value="ASSIGNED">Assigned</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="REOPENED">Reopened</option>
                </select>
              </div>

              {/* Control 2: Assign Department */}
              <div>
                <label className="block text-xs font-bold text-secondary-700 mb-1">
                  2. Assign Department
                </label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="w-full bg-secondary-50 border border-secondary-200 text-secondary-900 text-xs rounded-lg p-2.5 font-bold focus:ring-2 focus:ring-primary-500 focus:outline-none"
                >
                  {DEPARTMENTS_LIST.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              {/* Control 3: Change Priority */}
              <div>
                <label className="block text-xs font-bold text-secondary-700 mb-1">
                  3. Priority Level
                </label>
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="w-full bg-secondary-50 border border-secondary-200 text-secondary-900 text-xs rounded-lg p-2.5 font-bold focus:ring-2 focus:ring-primary-500 focus:outline-none"
                >
                  <option value="urgent">Urgent Priority</option>
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </select>
              </div>

              {/* Optional Officer Note */}
              <div>
                <label className="block text-[11px] font-bold text-secondary-500 mb-1">
                  Audit Log Note (Stored in status history)
                </label>
                <textarea
                  value={officerNote}
                  onChange={(e) => setOfficerNote(e.target.value)}
                  placeholder="Official reason or work order update..."
                  rows={2}
                  className="w-full bg-secondary-50 border border-secondary-200 rounded-lg p-2 text-xs text-secondary-900 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
              </div>

              <Button
                variant="primary"
                size="md"
                loading={saving}
                onClick={handleApplyOfficerControls}
                className="w-full font-extrabold text-xs shadow-sm py-2.5"
              >
                Apply & Synchronize to Database
              </Button>
            </div>
          </div>

          {/* Support & Votes Metrics Box */}
          <div className="bg-white border border-secondary-200 rounded-xl p-5 shadow-card space-y-3 text-xs">
            <h3 className="text-xs font-extrabold text-secondary-900 uppercase tracking-wider border-b border-secondary-100 pb-2">
              Citizen Engagement & Score
            </h3>

            <div className="flex items-center justify-between">
              <span className="text-secondary-500 font-medium">Upvotes</span>
              <span className="font-extrabold text-emerald-700">👍 {complaint.upvotes_count || 0}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-secondary-500 font-medium">Downvotes</span>
              <span className="font-extrabold text-red-700">👎 {complaint.downvotes_count || 0}</span>
            </div>

            <div className="flex items-center justify-between border-t border-secondary-100 pt-2">
              <span className="text-secondary-900 font-bold">Net Score</span>
              <span className={`font-extrabold text-sm ${netScore > 0 ? 'text-primary-700' : 'text-secondary-700'}`}>
                {netScore > 0 ? `+${netScore}` : netScore}
              </span>
            </div>
          </div>

          {/* Location & Pincode Card */}
          <div className="bg-white border border-secondary-200 rounded-xl p-5 shadow-card space-y-2.5 text-xs">
            <h3 className="text-xs font-extrabold text-secondary-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-secondary-100 pb-2">
              <MapPin size={14} className="text-primary-600" /> Location Details
            </h3>

            <div>
              <span className="text-secondary-400 text-[10px] block font-bold uppercase">Pincode</span>
              <span className="font-mono font-bold text-primary-700">📍 {complaint.pincode}</span>
            </div>

            <div>
              <span className="text-secondary-400 text-[10px] block font-bold uppercase">Department Assigned</span>
              <span className="font-bold text-secondary-800">{complaint.assigned_department || 'General Administration'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Municipal Parameters */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Update Municipal Complaint Parameters"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" loading={saving} onClick={handleApplyOfficerControls}>
              Save & Synchronize
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Select
            label="1. Change Status Stage"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="REPORTED">Reported (Open)</option>
            <option value="VERIFIED">Verified</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="REOPENED">Reopened</option>
          </Select>

          <Select
            label="2. Assign Department"
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
          >
            {DEPARTMENTS_LIST.map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </Select>

          <Textarea
            label="Officer Resolution Note (Stored in History Audit)"
            placeholder="Work order reference, site inspection results, or public note..."
            value={officerNote}
            onChange={(e) => setOfficerNote(e.target.value)}
            rows={3}
          />
        </div>
      </Modal>
    </div>
  );
}
