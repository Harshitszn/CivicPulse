import React, { useState } from 'react';
import { MapPin, Mail, Phone, Edit3, FileText, CheckCircle2, Clock, TrendingUp } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { StatusBadge } from '../../components/ui/Badge';
import { useToast } from '../../context/ToastContext';

const MOCK_USER = {
  name: 'Priya Sharma',
  email: 'priya.sharma@example.com',
  phone: '+91 98765 43210',
  pincode: '560001',
  ward: 'Ward 47',
  city: 'Bengaluru',
  joinedAt: '2024-01-15',
  stats: { total: 4, resolved: 1, inProgress: 1, open: 2 },
};

const ACTIVITY = [
  { type: 'reported', text: 'Reported pothole on MG Road', time: '30m ago', status: 'in_progress' },
  { type: 'voted',    text: 'Upvoted: No water supply in Sector 14', time: '2h ago', status: null },
  { type: 'comment',  text: 'Commented on: Garbage not collected', time: '1d ago', status: null },
  { type: 'resolved', text: 'Broken street lights — Resolved!', time: '3d ago', status: 'resolved' },
];

export default function Profile() {
  const { toast } = useToast();
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState({ name: MOCK_USER.name, phone: MOCK_USER.phone, pincode: MOCK_USER.pincode });

  const handleSave = () => {
    setEditOpen(false);
    toast.success('Profile updated!');
  };

  return (
    <div className="animate-fade-in">
      {/* Profile header */}
      <div className="flex items-center gap-4 mb-6 p-4 bg-surface border border-secondary-200 rounded-lg">
        <div className="w-16 h-16 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xl font-bold">{MOCK_USER.name.charAt(0)}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-bold text-secondary-900">{MOCK_USER.name}</h1>
          <p className="text-xs text-secondary-400 flex items-center gap-1 mt-0.5">
            <MapPin size={10} />{MOCK_USER.ward}, {MOCK_USER.city} — {MOCK_USER.pincode}
          </p>
          <p className="text-[10px] text-secondary-300 mt-1">
            Member since {new Date(MOCK_USER.joinedAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <Button variant="ghost" size="sm" icon={Edit3} onClick={() => setEditOpen(true)}>
          Edit
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        {[
          { label: 'Reported', value: MOCK_USER.stats.total,      color: 'text-secondary-700' },
          { label: 'Resolved', value: MOCK_USER.stats.resolved,   color: 'text-success'       },
          { label: 'Progress', value: MOCK_USER.stats.inProgress, color: 'text-warning'       },
          { label: 'Open',     value: MOCK_USER.stats.open,       color: 'text-primary-600'   },
        ].map((s) => (
          <div key={s.label} className="bg-surface border border-secondary-200 rounded-lg p-3 text-center">
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-secondary-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Contact info */}
      <Card className="mb-4" padding={false}>
        <div className="p-4">
          <h2 className="text-xs font-semibold text-secondary-500 uppercase tracking-wide mb-3">Contact</h2>
          <div className="space-y-2.5">
            <div className="flex items-center gap-2.5 text-sm">
              <Mail size={14} className="text-secondary-400 flex-shrink-0" />
              <span className="text-secondary-700">{MOCK_USER.email}</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm">
              <Phone size={14} className="text-secondary-400 flex-shrink-0" />
              <span className="text-secondary-700">{MOCK_USER.phone}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Recent activity */}
      <div>
        <h2 className="text-xs font-semibold text-secondary-500 uppercase tracking-wide mb-3">Recent Activity</h2>
        <div className="space-y-2">
          {ACTIVITY.map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-surface border border-secondary-200 rounded-lg">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs
                ${item.type === 'resolved' ? 'bg-green-100' : item.type === 'reported' ? 'bg-primary-100' : 'bg-secondary-100'}`}>
                {item.type === 'resolved' ? '✅' : item.type === 'voted' ? '👍' : item.type === 'comment' ? '💬' : '📋'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-secondary-700 line-clamp-1">{item.text}</p>
                <p className="text-[10px] text-secondary-400 mt-0.5">{item.time}</p>
              </div>
              {item.status && <StatusBadge status={item.status} />}
            </div>
          ))}
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Profile"
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSave}>Save Changes</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Full Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} id="profile-name" />
          <Input label="Phone Number" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} id="profile-phone" />
          <Input label="Pincode" value={form.pincode} onChange={(e) => setForm((f) => ({ ...f, pincode: e.target.value }))} id="profile-pincode" />
        </div>
      </Modal>
    </div>
  );
}
