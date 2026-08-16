import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Clock, User, Building2, CheckCircle2, AlertTriangle,
  ShieldCheck, ThumbsUp, ThumbsDown, Sparkles, MessageCircle, Send, Shield,
  Calendar, Layers, Sliders, Check
} from 'lucide-react';
import { StatusBadge, CategoryBadge, PriorityBadge } from '../../components/ui/Badge';
import StatusTimeline from '../../components/ui/StatusTimeline';
import Button from '../../components/ui/Button';
import { Select, Textarea } from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { useToast } from '../../context/ToastContext';
import { usePincode } from '../../context/PincodeContext';

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
  const {
    allComplaints,
    updateComplaintDetails,
    getComplaintVotes,
    getComplaintVerification,
    getComplaintComments,
    addComment,
  } = usePincode();

  const activeId = id || '1';

  // Find complaint from shared store
  const complaint = useMemo(() => {
    const found = allComplaints.find((c) => String(c._id) === String(activeId));
    if (found) return found;
    return {
      _id: activeId,
      title: 'Hazardous deep pothole on MG Road near Bus Stop 12',
      description: 'A massive 3-foot deep pothole has formed right in front of the main bus shelter. Two two-wheelers skidded last night. Needs immediate asphalt resurfacing.',
      imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
      category: 'Roads',
      categorySlug: 'roads',
      pincode: '560001',
      ward: 'Ward 47',
      priority: 'urgent',
      department: 'Public Works Department',
      status: 'in_progress',
      upvotes: 142,
      downvotes: 3,
      commentCount: 28,
      estimatedResolution: '3–5 Days',
      aiAnalysis: {
        category: 'Road Damage',
        issue: 'Large Pothole Hazard',
        department: 'Public Works Department',
        priority: 'High',
        estimatedResolution: '3–5 Days',
        confidence: 94,
      },
      reportedBy: { name: 'Priya Sharma', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80', isAnonymous: false },
      createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    };
  }, [allComplaints, activeId]);

  // Dynamic metrics derived from shared context
  const { upvotes, downvotes, netScore } = getComplaintVotes(complaint._id, complaint.upvotes, complaint.downvotes);
  const { confirmedCount, notConfirmedCount, totalResponses, confirmationPct } = getComplaintVerification(complaint._id);
  const { comments, count: commentsCount } = getComplaintComments(complaint._id, complaint.commentCount || 0);

  // ── Officer Controls Local Form State ──────────────────────────────────────
  const [selectedStatus, setSelectedStatus] = useState(complaint.status || 'open');
  const [selectedDepartment, setSelectedDepartment] = useState(complaint.department || 'Public Works Department');
  const [selectedPriority, setSelectedPriority] = useState(complaint.priority || 'medium');
  const [selectedResolution, setSelectedResolution] = useState(complaint.estimatedResolution || '3–5 Days');
  const [officerNote, setOfficerNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [officerCommentText, setOfficerCommentText] = useState('');

  // Keep control form synced when complaint changes
  useEffect(() => {
    if (complaint) {
      setSelectedStatus(complaint.status || 'open');
      setSelectedDepartment(complaint.department || 'Public Works Department');
      setSelectedPriority(complaint.priority || 'medium');
      setSelectedResolution(complaint.estimatedResolution || '3–5 Days');
    }
  }, [complaint]);

  // ── Submit Officer Controls Updates ─────────────────────────────────────────
  const handleApplyOfficerControls = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));

    // Update shared complaint state
    updateComplaintDetails(complaint._id, {
      status: selectedStatus,
      department: selectedDepartment,
      priority: selectedPriority,
      estimatedResolution: selectedResolution,
    });

    // If officer added a note, post it as an official comment update
    if (officerNote.trim()) {
      addComment(complaint._id, {
        content: `Official Update (${selectedDepartment}): ${officerNote.trim()}`,
        isAnonymous: false,
        authorName: `${selectedDepartment} Officer`,
      });
      setOfficerNote('');
    }

    setSaving(false);
    setModalOpen(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
    toast.success('Status updated. Changes are now visible to citizens.');
  };

  // Officer direct reply to comments
  const handleOfficerCommentSubmit = (e) => {
    e.preventDefault();
    if (!officerCommentText.trim()) return;

    addComment(complaint._id, {
      content: officerCommentText.trim(),
      isAnonymous: false,
      authorName: `${selectedDepartment} Officer`,
      isOfficialUpdate: true,
    });
    setOfficerCommentText('');
  };

  // AI Classification Data
  const aiInfo = complaint.aiAnalysis || {
    category: complaint.category || 'Infrastructure Damage',
    issue: complaint.title,
    department: complaint.department,
    priority: complaint.priority.charAt(0).toUpperCase() + complaint.priority.slice(1),
    estimatedResolution: complaint.estimatedResolution || '3–5 Days',
    confidence: 94,
  };

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
              <span className="font-extrabold text-primary-700 text-sm">#{complaint._id}</span>
              <StatusBadge status={complaint.status} />
              <PriorityBadge priority={complaint.priority} />
            </div>
            <h1 className="text-lg font-extrabold text-secondary-900 leading-snug mt-0.5">
              {complaint.title}
            </h1>
          </div>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setModalOpen(true)}
          icon={Sliders}
          className="font-bold text-xs"
        >
          Update Municipal Parameters
        </Button>

        {saveSuccess && (
          <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 animate-fade-in">
            <CheckCircle2 size={14} /> Status updated
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Main Left Column (Complaint Details + AI + Timeline + Comments) ── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Visual Complaint Post Card */}
          <div className="bg-white border border-secondary-200 rounded-xl overflow-hidden shadow-card">
            {/* Image Preview */}
            {complaint.imageUrl && (
              <div className="relative bg-secondary-900 aspect-video overflow-hidden border-b border-secondary-200">
                <img
                  src={complaint.imageUrl}
                  alt={complaint.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-bold flex items-center gap-1.5 border border-white/20">
                  <MapPin size={13} className="text-primary-400" />
                  PIN: {complaint.pincode} ({complaint.ward || 'Local Ward'})
                </div>
              </div>
            )}

            <div className="p-5 space-y-4">
              {/* Category & Metadata */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-secondary-100 pb-3">
                <div className="flex items-center gap-2">
                  <CategoryBadge category={complaint.category || complaint.categorySlug} />
                  <span className="text-xs text-secondary-400">• Reported {timeAgo(complaint.createdAt)}</span>
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold text-secondary-700">
                  <User size={14} className="text-secondary-400" />
                  <span>Reported By: {complaint.reportedBy?.isAnonymous ? 'Anonymous Resident' : (complaint.reportedBy?.name || 'Priya Sharma')}</span>
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

          {/* ── Prototype AI Classification Pipeline Panel ──────────────────── */}
          <div className="bg-gradient-to-br from-primary-50/70 via-white to-indigo-50/50 border border-primary-200 rounded-xl p-5 shadow-card space-y-3">
            <div className="flex items-center justify-between border-b border-primary-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-primary-600 text-white rounded-lg">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-secondary-900">Prototype AI Classification Analysis</h3>
                  <p className="text-[11px] text-primary-700 font-semibold">Automated visual & natural language feature extraction</p>
                </div>
              </div>

              <span className="px-2.5 py-1 bg-white text-primary-700 font-extrabold text-xs rounded-full border border-primary-200 shadow-xs flex items-center gap-1">
                <Check size={13} className="text-emerald-600" /> {aiInfo.confidence || 94}% Confidence
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1 text-xs">
              <div className="bg-white border border-primary-100 rounded-lg p-3">
                <span className="text-[10px] font-bold text-secondary-400 uppercase tracking-wider block mb-0.5">AI Category</span>
                <span className="font-extrabold text-secondary-900">{aiInfo.category}</span>
              </div>

              <div className="bg-white border border-primary-100 rounded-lg p-3">
                <span className="text-[10px] font-bold text-secondary-400 uppercase tracking-wider block mb-0.5">Detected Issue</span>
                <span className="font-extrabold text-secondary-900">{aiInfo.issue}</span>
              </div>

              <div className="bg-white border border-primary-100 rounded-lg p-3">
                <span className="text-[10px] font-bold text-secondary-400 uppercase tracking-wider block mb-0.5">Suggested Dept</span>
                <span className="font-extrabold text-primary-700 truncate block">{aiInfo.department}</span>
              </div>

              <div className="bg-white border border-primary-100 rounded-lg p-3">
                <span className="text-[10px] font-bold text-secondary-400 uppercase tracking-wider block mb-0.5">Assigned Priority</span>
                <span className="font-extrabold text-red-700">{aiInfo.priority}</span>
              </div>

              <div className="bg-white border border-primary-100 rounded-lg p-3">
                <span className="text-[10px] font-bold text-secondary-400 uppercase tracking-wider block mb-0.5">Est. Resolution</span>
                <span className="font-extrabold text-emerald-700">{aiInfo.estimatedResolution}</span>
              </div>

              <div className="bg-white border border-primary-100 rounded-lg p-3">
                <span className="text-[10px] font-bold text-secondary-400 uppercase tracking-wider block mb-0.5">AI Pipeline Status</span>
                <span className="font-extrabold text-primary-600">Verified & Approved</span>
              </div>
            </div>
          </div>

          {/* ── Status Progression Stepper ─────────────────────────────────── */}
          <div className="bg-white border border-secondary-200 rounded-xl p-5 shadow-card space-y-3">
            <h3 className="text-xs font-extrabold text-secondary-900 uppercase tracking-wider border-b border-secondary-100 pb-2">
              Municipal Resolution Timeline Stage
            </h3>
            <StatusTimeline currentStatus={complaint.status} layout="vertical" />
          </div>

          {/* ── Citizen Status Verification Panel ────────────────────────────── */}
          <div className="bg-white border border-secondary-200 rounded-xl p-5 shadow-card space-y-3">
            <div className="flex items-center justify-between border-b border-secondary-100 pb-3">
              <h3 className="text-xs font-bold text-secondary-900 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-primary-600" />
                Community Confirmation & Verification Stats
              </h3>

              {totalResponses > 0 ? (
                <span className="text-xs font-extrabold text-primary-700 bg-primary-50 px-2.5 py-1 rounded-lg border border-primary-200">
                  {confirmationPct}% Confirmed
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
                  <ThumbsUp size={18} /> {confirmedCount}
                </p>
                <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mt-0.5">Yes, Confirmed</p>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                <p className="text-xl font-extrabold text-red-800 flex items-center justify-center gap-1.5">
                  <ThumbsDown size={18} /> {notConfirmedCount}
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
                Community Discussion & Official Notes ({commentsCount})
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
                placeholder="Post work order update, site inspection notice, or field dispatch status for residents to see..."
                rows={2}
                className="w-full bg-white border border-secondary-200 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-primary-500 focus:outline-none text-secondary-900"
              />
              <div className="flex justify-end">
                <Button type="submit" variant="primary" size="sm" icon={Send} className="font-bold text-xs">
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
                    key={comment._id}
                    className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                      comment.author?.isOfficial
                        ? 'bg-primary-50/80 border-primary-200'
                        : 'bg-secondary-50 border-secondary-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-secondary-900">
                          {comment.author?.name || 'Resident'}
                        </span>
                        {comment.author?.isOfficial && (
                          <span className="px-2 py-0.5 bg-primary-600 text-white font-extrabold text-[9px] rounded-full uppercase tracking-wider">
                            OFFICIAL OFFICER UPDATE
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-secondary-400 font-medium">
                        {timeAgo(comment.createdAt)}
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
                <p className="text-[11px] text-secondary-500">Update parameters live for citizen view</p>
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
                  <option value="open">Reported (Open)</option>
                  <option value="verified">Verified</option>
                  <option value="assigned">Assigned</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
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
                  3. Change Priority Level
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

              {/* Control 4: Change Estimated Resolution */}
              <div>
                <label className="block text-xs font-bold text-secondary-700 mb-1">
                  4. Change Estimated Resolution
                </label>
                <select
                  value={selectedResolution}
                  onChange={(e) => setSelectedResolution(e.target.value)}
                  className="w-full bg-secondary-50 border border-secondary-200 text-secondary-900 text-xs rounded-lg p-2.5 font-bold focus:ring-2 focus:ring-primary-500 focus:outline-none"
                >
                  {RESOLUTION_TARGETS.map((target) => (
                    <option key={target} value={target}>{target}</option>
                  ))}
                </select>
              </div>

              {/* Optional Officer Note */}
              <div>
                <label className="block text-[11px] font-bold text-secondary-500 mb-1">
                  Officer Note (Optional)
                </label>
                <textarea
                  value={officerNote}
                  onChange={(e) => setOfficerNote(e.target.value)}
                  placeholder="Note attached to complaint resolution history..."
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
                Apply & Synchronize Changes
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
              <span className="font-extrabold text-emerald-700">👍 {upvotes}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-secondary-500 font-medium">Downvotes</span>
              <span className="font-extrabold text-red-700">👎 {downvotes}</span>
            </div>

            <div className="flex items-center justify-between border-t border-secondary-100 pt-2">
              <span className="text-secondary-900 font-bold">Net Score</span>
              <span className={`font-extrabold text-sm ${netScore > 0 ? 'text-primary-700' : 'text-secondary-700'}`}>
                {netScore > 0 ? `+${netScore}` : netScore}
              </span>
            </div>

            <div className="flex items-center justify-between border-t border-secondary-100 pt-2">
              <span className="text-secondary-500 font-medium">Est. Resolution Target</span>
              <span className="font-extrabold text-indigo-700">{complaint.estimatedResolution || '3–5 Days'}</span>
            </div>
          </div>

          {/* Location & Pincode Card */}
          <div className="bg-white border border-secondary-200 rounded-xl p-5 shadow-card space-y-2.5 text-xs">
            <h3 className="text-xs font-extrabold text-secondary-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-secondary-100 pb-2">
              <MapPin size={14} className="text-primary-600" /> Location Details
            </h3>

            <div>
              <span className="text-secondary-400 text-[10px] block font-bold uppercase">Address</span>
              <span className="font-bold text-secondary-800">{complaint.address || complaint.title}</span>
            </div>

            <div className="flex justify-between pt-1">
              <div>
                <span className="text-secondary-400 text-[10px] block font-bold uppercase">Pincode</span>
                <span className="font-mono font-bold text-primary-700">📍 {complaint.pincode}</span>
              </div>
              <div>
                <span className="text-secondary-400 text-[10px] block font-bold uppercase">Ward Zone</span>
                <span className="font-bold text-secondary-800">{complaint.ward || 'Ward 47'}</span>
              </div>
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
            <option value="open">Reported (Open)</option>
            <option value="verified">Verified</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
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

          <Select
            label="3. Change Priority Level"
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
          >
            <option value="urgent">Urgent Priority</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </Select>

          <Select
            label="4. Change Estimated Resolution"
            value={selectedResolution}
            onChange={(e) => setSelectedResolution(e.target.value)}
          >
            {RESOLUTION_TARGETS.map((target) => (
              <option key={target} value={target}>{target}</option>
            ))}
          </Select>

          <Textarea
            label="Officer Resolution Note (Optional)"
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
