import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Mail, Phone, Edit3, Shield, LogOut, LogIn, User } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { StatusBadge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { usePincode } from '../../context/PincodeContext';

export default function Profile() {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated, logout, updateProfile } = useAuth();
  const { allComplaints } = usePincode();

  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    pincode: '',
  });

  useEffect(() => {
    if (currentUser) {
      setForm({
        name: currentUser.full_name || currentUser.name || '',
        phone: currentUser.phone || '',
        pincode: currentUser.pincode || '',
      });
    }
  }, [currentUser]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({
        full_name: form.name,
        phone: form.phone,
        pincode: form.pincode,
      });
      setEditOpen(false);
    } catch {
      // Error toasted by context
    } finally {
      setSaving(false);
    }
  };

  // Compute actual user complaint statistics
  const userComplaints = allComplaints.filter(
    (c) => c.userId === currentUser?.id || (currentUser?.email && c.reportedBy?.email === currentUser.email)
  );

  const stats = {
    total: userComplaints.length,
    resolved: userComplaints.filter((c) => c.status === 'resolved' || c.status === 'verified').length,
    inProgress: userComplaints.filter((c) => c.status === 'in_progress' || c.status === 'assigned').length,
    open: userComplaints.filter((c) => c.status === 'pending' || c.status === 'reported' || c.status === 'open').length,
  };

  if (!isAuthenticated || !currentUser?.email) {
    return (
      <div className="animate-fade-in w-full max-w-lg mx-auto text-center py-16 px-4">
        <div className="w-16 h-16 rounded-2xl bg-primary-100 flex items-center justify-center mx-auto mb-4 text-primary-600">
          <User size={32} />
        </div>
        <h1 className="text-2xl font-extrabold text-secondary-900 mb-2">Sign In to View Profile</h1>
        <p className="text-sm text-secondary-500 mb-6">
          Authenticate with your registered citizen account to track your submitted grievances, vote on local issues, and manage postal jurisdiction.
        </p>
        <Button variant="primary" icon={LogIn} size="lg" onClick={() => navigate('/login')} className="font-bold">
          Sign In / Register
        </Button>
      </div>
    );
  }

  const displayName = currentUser.full_name || currentUser.name || 'Citizen Resident';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="animate-fade-in w-full max-w-4xl mx-auto">
      {/* Profile header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 p-4 sm:p-6 bg-surface border border-secondary-200 rounded-xl shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="text-white text-xl font-bold">{initial}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-secondary-900">{displayName}</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-primary-50 text-primary-700 border border-primary-200 uppercase">
                {currentUser.role || 'Citizen'}
              </span>
            </div>
            <p className="text-xs text-secondary-500 flex items-center gap-1 mt-0.5">
              <MapPin size={11} className="text-primary-600" />
              Resident Postal Zone — {currentUser.pincode || 'Not Set'}
            </p>
            <p className="text-[10px] text-secondary-400 mt-1">
              Member since{' '}
              {currentUser.created_at
                ? new Date(currentUser.created_at).toLocaleDateString('en-IN', {
                    month: 'long',
                    year: 'numeric',
                  })
                : 'Recently'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={Edit3} onClick={() => setEditOpen(true)}>
            Edit Profile
          </Button>
          <Button variant="ghost" size="sm" icon={LogOut} onClick={logout} className="text-red-600 hover:bg-red-50">
            Sign Out
          </Button>
        </div>
      </div>

      {/* Real Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
        {[
          { label: 'My Reports', value: stats.total, color: 'text-secondary-700' },
          { label: 'Resolved', value: stats.resolved, color: 'text-success' },
          { label: 'In Progress', value: stats.inProgress, color: 'text-warning' },
          { label: 'Pending', value: stats.open, color: 'text-primary-600' },
        ].map((s) => (
          <div key={s.label} className="bg-surface border border-secondary-200 rounded-lg p-3 text-center shadow-xs">
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-secondary-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Contact info */}
      <Card className="mb-4" padding={false}>
        <div className="p-4">
          <h2 className="text-xs font-semibold text-secondary-500 uppercase tracking-wide mb-3">
            Account Information
          </h2>
          <div className="space-y-2.5">
            <div className="flex items-center gap-2.5 text-sm">
              <Mail size={14} className="text-secondary-400 flex-shrink-0" />
              <span className="text-secondary-700">{currentUser.email}</span>
            </div>
            {currentUser.phone && (
              <div className="flex items-center gap-2.5 text-sm">
                <Phone size={14} className="text-secondary-400 flex-shrink-0" />
                <span className="text-secondary-700">{currentUser.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-2.5 text-sm">
              <MapPin size={14} className="text-secondary-400 flex-shrink-0" />
              <span className="text-secondary-700">Pincode: {currentUser.pincode}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Profile"
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" loading={saving} onClick={handleSave}>
              Save Changes
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Full Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            id="profile-name"
          />
          <Input
            label="Phone Number"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            id="profile-phone"
          />
          <Input
            label="Resident Pincode"
            value={form.pincode}
            maxLength={6}
            onChange={(e) => setForm((f) => ({ ...f, pincode: e.target.value }))}
            id="profile-pincode"
          />
        </div>
      </Modal>
    </div>
  );
}
