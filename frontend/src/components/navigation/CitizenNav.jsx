import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Rss, PlusCircle, FileText, User, MapPin, Edit2, ShieldAlert, BarChart2 } from 'lucide-react';
import { usePincode } from '../../context/PincodeContext';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';

const NAV_ITEMS = [
  { to: '/',             label: 'Home',           desktopLabel: 'Home',           icon: Home,       id: 'nav-home'     },
  { to: '/feed',         label: 'Feed',           desktopLabel: 'Feed',           icon: Rss,        id: 'nav-feed'     },
  { to: '/insights',     label: 'Insights',       desktopLabel: 'Civic Insights', icon: BarChart2,  id: 'nav-insights' },
  { to: '/report',       label: 'Report',         desktopLabel: 'Report',         icon: PlusCircle, id: 'nav-report'   },
  { to: '/my-complaints',label: 'Mine',           desktopLabel: 'Mine',           icon: FileText,   id: 'nav-mine'     },
  { to: '/profile',      label: 'Profile',        desktopLabel: 'Profile',        icon: User,       id: 'nav-profile'  },
];

function CitizenNav() {
  const { registeredPincode, setRegisteredPincode, currentUser, loginAsUser, DEMO_USERS } = usePincode();
  const [pincodeModalOpen, setPincodeModalOpen] = useState(false);
  const [tempPincode, setTempPincode] = useState(registeredPincode);
  const [error, setError] = useState('');

  const handleSavePincode = (e) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(tempPincode.trim())) {
      setError('Please enter a valid 6-digit postal code');
      return;
    }
    setError('');
    setRegisteredPincode(tempPincode.trim());
    setPincodeModalOpen(false);
  };

  return (
    <>
      {/* ── Top Header (desktop) ─────────────────────────────────────────── */}
      <header className="hidden md:flex items-center justify-between px-6 h-14 bg-surface border-b border-secondary-200 sticky top-0 z-40">
        <div className="flex items-center gap-6">
          <NavLink to="/" className="flex items-center gap-2 no-underline">
            <span className="w-7 h-7 rounded-lg bg-primary-600 flex items-center justify-center shadow-sm">
              <span className="text-white text-xs font-bold">CP</span>
            </span>
            <span className="text-base font-bold text-secondary-900">CivicPulse</span>
          </NavLink>

          {/* Registered Pincode Badge */}
          <button
            onClick={() => { setTempPincode(registeredPincode); setPincodeModalOpen(true); }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-50 hover:bg-primary-100 border border-primary-200 text-xs font-bold text-primary-700 transition-colors"
            title="Click to update your registered voting pincode"
          >
            <MapPin size={13} className="text-primary-600" />
            <span>Residing in {registeredPincode}</span>
            <Edit2 size={11} className="text-primary-500 ml-0.5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Demo User Switcher */}
          <div className="flex items-center gap-1.5 bg-primary-50 px-2 py-1 rounded-lg border border-primary-200 text-xs">
            <span className="text-[10px] font-extrabold text-primary-800 uppercase">Demo User:</span>
            <select
              value={currentUser?.email || 'citizen@demo.com'}
              onChange={(e) => {
                const u = loginAsUser(e.target.value);
                if (u.role === 'officer') window.location.href = '/municipal/dashboard';
              }}
              className="bg-white border border-primary-300 text-secondary-900 text-xs font-extrabold rounded px-1.5 py-0.5 focus:outline-none cursor-pointer shadow-xs"
            >
              {(DEMO_USERS || []).map((u) => (
                <option key={u.email} value={u.email}>
                  {u.name} ({u.role === 'officer' ? 'Officer' : `PIN ${u.pincode}`})
                </option>
              ))}
            </select>
          </div>

          <nav className="flex items-center gap-1">
            {NAV_ITEMS.map(({ to, label, desktopLabel, icon: Icon, id }) => (
              <NavLink
                key={to}
                to={to}
                id={id}
                end={to === '/'}
                className={({ isActive }) =>
                  [
                    'flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-fast no-underline',
                    isActive
                      ? 'bg-primary-50 text-primary-700 font-bold'
                      : 'text-secondary-500 hover:text-secondary-700 hover:bg-secondary-100',
                  ].join(' ')
                }
              >
                <Icon size={16} />
                {desktopLabel || label}
              </NavLink>
            ))}
            <NavLink
              to="/municipal/login"
              className="ml-2 text-xs font-semibold text-secondary-500 hover:text-primary-600 px-2.5 py-1.5 rounded border border-secondary-200 no-underline transition-colors"
            >
              Officer Portal →
            </NavLink>
          </nav>
        </div>
      </header>

      {/* ── Mobile Top Bar ───────────────────────────────────────────────── */}
      <header className="md:hidden flex items-center justify-between px-4 h-14 bg-surface border-b border-secondary-200 sticky top-0 z-40">
        <NavLink to="/" className="flex items-center gap-2 no-underline">
          <span className="w-7 h-7 rounded-lg bg-primary-600 flex items-center justify-center shadow-sm">
            <span className="text-white text-xs font-bold">CP</span>
          </span>
          <span className="text-sm font-bold text-secondary-900">CivicPulse</span>
        </NavLink>

        <button
          onClick={() => { setTempPincode(registeredPincode); setPincodeModalOpen(true); }}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-50 border border-primary-200 text-xs font-bold text-primary-700"
        >
          <MapPin size={12} className="text-primary-600" />
          <span>PIN: {registeredPincode}</span>
        </button>
      </header>

      {/* ── Mobile Bottom Nav ────────────────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface border-t border-secondary-200 flex items-stretch shadow-lg">
        {NAV_ITEMS.map(({ to, label, icon: Icon, id }) => (
          <NavLink
            key={to}
            to={to}
            id={`${id}-mobile`}
            end={to === '/'}
            className={({ isActive }) =>
              [
                'flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition-colors duration-fast no-underline',
                isActive
                  ? 'text-primary-600 font-bold'
                  : 'text-secondary-400 hover:text-secondary-600',
              ].join(' ')
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── Change Registered Pincode Modal ───────────────────────────── */}
      <Modal
        isOpen={pincodeModalOpen}
        onClose={() => setPincodeModalOpen(false)}
        title="Update Registered Pincode"
        footer={
          <>
            <Button variant="ghost" onClick={() => setPincodeModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSavePincode}>Save Pincode</Button>
          </>
        }
      >
        <form onSubmit={handleSavePincode} className="space-y-4">
          <p className="text-xs text-secondary-500 leading-relaxed">
            Your registered pincode determines which civic issues you are eligible to vote on. Voting is restricted to verified residents of that specific postal zone.
          </p>
          <Input
            label="Your Resident Pincode (6 digits)"
            placeholder="e.g. 560001"
            value={tempPincode}
            onChange={(e) => { setTempPincode(e.target.value); setError(''); }}
            error={error}
            maxLength={6}
            inputMode="numeric"
            id="pincode-modal-input"
            autoFocus
          />
        </form>
      </Modal>
    </>
  );
}

export default CitizenNav;
