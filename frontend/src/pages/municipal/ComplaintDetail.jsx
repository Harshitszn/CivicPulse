import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, User, Building2, CheckCircle2, AlertCircle } from 'lucide-react';
import { StatusBadge, CategoryBadge, PriorityBadge } from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { Select } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { useToast } from '../../context/ToastContext';

const MOCK = {
  _id: '1',
  title: 'Giant pothole on MG Road near bus stop causing accidents',
  description: 'There is a massive pothole measuring approximately 3 feet wide near Bus Stop 12 on MG Road. Multiple accidents have been reported. Residents are extremely concerned.',
  category: 'roads', status: 'in_progress', priority: 'high',
  location: { address: 'MG Road, near Bus Stop 12', pincode: '560001', ward: 'Ward 47', city: 'Bengaluru' },
  reportedBy: { name: 'Priya Sharma', email: 'priya@example.com' },
  assignedTo: { name: 'Roads & Infrastructure Dept.' },
  upvotes: 128, commentCount: 23,
  createdAt: '2024-07-15T08:30:00Z',
};

const STATUS_OPTIONS = [
  { value: 'open', label: 'Open' },
  { value: 'acknowledged', label: 'Acknowledged' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'rejected', label: 'Rejected' },
];

export default function MunicipalComplaintDetail() {
  const { id } = useParams();
  const { toast } = useToast();
  const [status, setStatus] = useState(MOCK.status);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const handleStatusUpdate = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    setUpdateOpen(false);
    toast.success(`Status updated to "${status}"`);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-5">
        <Link to="/municipal/complaints" className="inline-flex items-center gap-1.5 text-sm text-secondary-400 hover:text-primary-600 no-underline transition-colors">
          <ArrowLeft size={14} /> Back to Complaints
        </Link>
        <Button variant="primary" size="sm" onClick={() => setUpdateOpen(true)}>
          Update Status
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-surface border border-secondary-200 rounded-lg p-5">
            <div className="flex items-start gap-3 mb-3">
              <div className="flex-1">
                <div className="flex flex-wrap gap-2 mb-2">
                  <CategoryBadge category={MOCK.category} />
                  <StatusBadge status={status} />
                  <PriorityBadge priority={MOCK.priority} />
                </div>
                <h2 className="text-base font-bold text-secondary-900">{MOCK.title}</h2>
              </div>
            </div>
            <p className="text-sm text-secondary-600 leading-relaxed">{MOCK.description}</p>
          </div>

          {/* Location */}
          <div className="bg-surface border border-secondary-200 rounded-lg p-5">
            <h3 className="text-xs font-semibold text-secondary-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <MapPin size={12} /> Location
            </h3>
            <div className="space-y-1.5 text-sm text-secondary-600">
              <p>{MOCK.location.address}</p>
              <p>{MOCK.location.ward} · {MOCK.location.city} · {MOCK.location.pincode}</p>
            </div>
            {/* Map placeholder */}
            <div className="mt-3 h-32 rounded-lg bg-secondary-100 flex items-center justify-center border border-secondary-200">
              <p className="text-xs text-secondary-400">📍 Map view — coming soon</p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Reporter */}
          <div className="bg-surface border border-secondary-200 rounded-lg p-4">
            <h3 className="text-xs font-semibold text-secondary-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <User size={12} /> Reported By
            </h3>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-primary-700 text-xs font-bold">{MOCK.reportedBy.name.charAt(0)}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-secondary-800">{MOCK.reportedBy.name}</p>
                <p className="text-xs text-secondary-400">{MOCK.reportedBy.email}</p>
              </div>
            </div>
          </div>

          {/* Dept */}
          <div className="bg-surface border border-secondary-200 rounded-lg p-4">
            <h3 className="text-xs font-semibold text-secondary-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <Building2 size={12} /> Assigned Department
            </h3>
            <p className="text-sm font-medium text-secondary-800">{MOCK.assignedTo.name}</p>
            <Button variant="ghost" size="sm" className="mt-2 w-full">Reassign</Button>
          </div>

          {/* Meta */}
          <div className="bg-surface border border-secondary-200 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-secondary-400">Reported</span>
              <span className="text-secondary-700">{new Date(MOCK.createdAt).toLocaleDateString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-secondary-400">Support votes</span>
              <span className="text-secondary-700 font-medium">{MOCK.upvotes}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-secondary-400">Comments</span>
              <span className="text-secondary-700">{MOCK.commentCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Update status modal */}
      <Modal
        isOpen={updateOpen}
        onClose={() => setUpdateOpen(false)}
        title="Update Complaint Status"
        footer={
          <>
            <Button variant="ghost" onClick={() => setUpdateOpen(false)}>Cancel</Button>
            <Button variant="primary" loading={saving} onClick={handleStatusUpdate}>Save Update</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Select
            label="New Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            id="update-status"
          >
            {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </Select>
          <Textarea
            label="Note (optional)"
            placeholder="Describe the action taken or reason for status change..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            id="update-note"
          />
        </div>
      </Modal>
    </div>
  );
}
