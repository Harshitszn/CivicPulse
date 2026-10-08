import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Rss, PlusCircle, FileText, User, MapPin, Edit2, LogIn, LogOut, BarChart2, ChevronDown, Check } from 'lucide-react';
import { usePincode } from '../../context/PincodeContext';
import { useAuth } from '../../context/AuthContext';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';

const POPULAR_ZONES = [
  { code: 'all', label: 'All Zones (Citywide)' },
  { code: '400064', label: '400064 - Malad West' },
  { code: '400067', label: '400067 - Kandivali West' },
  { code: '400076', label: '400076 - Powai' },
  { code: '400054', label: '400054 - Santacruz West' },
  { code: '110001', label: '110001 - Connaught Place' },
  { code: '560001', label: '560001 - Bangalore Central' },
];

const NAV_ITEMS = [
  { to: '/',             label: 'Home',           desktopLabel: 'Home',           icon: Home,       id: 'nav-home'     },
  { to: '/feed',         label: 'Feed',           desktopLabel: 'Feed',           icon: Rss,        id: 'nav-feed'     },
  { to: '/insights',     label: 'Insights',       desktopLabel: 'Civic Insights', icon: BarChart2,  id: 'nav-insights' },
  { to: '/report',       label: 'Report',         desktopLabel: 'Report',         icon: PlusCircle, id: 'nav-report'   },
  { to: '/my-complaints',label: 'Mine',           desktopLabel: 'Mine',           icon: FileText,   id: 'nav-mine'     },
  { to: '/profile',      label: 'Profile',        desktopLabel: 'Profile',        icon: User,       id: 'nav-profile'  },
];

function CitizenNav() {
  const navigate = useNavigate();
  const { registeredPincode, setRegisteredPincode, globalPincode, setGlobalPincode } = usePincode();
  const { currentUser, isAuthenticated, logout } = useAuth();
  const [zoneModalOpen, setZoneModalOpen] = useState(false);
  const [customPincode, setCustomPincode] = useState('');
  const [customError, setCustomError] = useState('');

  const handleSelectZone = (code) => {
    setGlobalPincode(code);
    setZoneModalOpen(false);
  };

  const handleApplyCustomPincode = (e) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(customPincode.trim())) {
      setCustomError('Please enter a valid 6-digit postal code');
      return;
    }
    setCustomError('');
    setGlobalPincode(customPincode.trim());
    setZoneModalOpen(false);
  };

  const displayName = currentUser?.full_name || currentUser?.name || 'Citizen';

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

          {/* Global Browsing Pincode Zone Selector Badge */}
          <button
            onClick={() => setZoneModalOpen(true)}
            id="global-zone-selector-btn"
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-50 hover:bg-primary-100 border border-primary-200 text-xs font-bold text-primary-700 transition-colors cursor-pointer shadow-xs"
            title="Filter Feed, Search, and Civic Insights by pincode zone"
          >
            <MapPin size={13} className="text-primary-600" />
            <span>Zone: {globalPincode === 'all' ? 'All Wards' : globalPincode}</span>
            <ChevronDown size={12} className="text-primary-500 ml-0.5" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* User Status / Login Button */}
          {isAuthenticated && currentUser?.email ? (
            <div className="flex items-center gap-2 bg-secondary-50 px-2.5 py-1 rounded-lg border border-secondary-200 text-xs">
              <div className="w-5 h-5 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-[10px]">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <span className="font-bold text-secondary-800 max-w-[120px] truncate">{displayName}</span>
              <button
                onClick={logout}
                className="text-secondary-400 hover:text-red-600 p-0.5 ml-1 transition-colors cursor-pointer"
                title="Sign out"
              >
                <LogOut size={13} />
              </button>
            </div>
          ) : (
            <Button
              variant="primary"
              size="sm"
              icon={LogIn}
              onClick={() => navigate('/login')}
              className="text-xs font-bold py-1.5"
            >
              Sign In
            </Button>
          )}

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

        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoneModalOpen(true)}
            id="global-zone-selector-mobile-btn"
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-50 border border-primary-200 text-xs font-bold text-primary-700"
          >
            <MapPin size={12} className="text-primary-600" />
            <span>Zone: {globalPincode === 'all' ? 'All' : globalPincode}</span>
          </button>
          {!isAuthenticated && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/login')}
              className="text-xs font-bold py-1 px-2.5"
            >
              Sign In
            </Button>
          )}
        </div>
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

      {/* ── Global Pincode Zone Filter Modal ───────────────────────────── */}
      <Modal
        isOpen={zoneModalOpen}
        onClose={() => setZoneModalOpen(false)}
        title="Select Civic Zone / Pincode"
        footer={
          <Button variant="ghost" onClick={() => setZoneModalOpen(false)}>
            Close
          </Button>
        }
      >
        <div className="space-y-4">
          <p className="text-xs text-secondary-500 leading-relaxed">
            Choose a postal zone to filter the <strong>FeedLoop</strong>, <strong>Complaint Search</strong>, and <strong>Civic Insights</strong> across real municipal database records.
          </p>

          <div>
            <label className="text-xs font-bold text-secondary-700 block mb-2">Available Civic Zones</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {POPULAR_ZONES.map((zone) => {
                const isActive = globalPincode === zone.code;
                return (
                  <button
                    key={zone.code}
                    type="button"
                    onClick={() => handleSelectZone(zone.code)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold text-left transition-all ${
                      isActive
                        ? 'bg-primary-50 border-primary-500 text-primary-900 ring-2 ring-primary-200'
                        : 'bg-white border-secondary-200 text-secondary-700 hover:bg-secondary-50 hover:border-secondary-300'
                    }`}
                  >
                    <span className="truncate">{zone.label}</span>
                    {isActive && <Check size={14} className="text-primary-600 flex-shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleApplyCustomPincode} className="pt-2 border-t border-secondary-100">
            <label className="text-xs font-bold text-secondary-700 block mb-1.5">Or Enter Custom 6-Digit PIN</label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="e.g. 400064"
                  value={customPincode}
                  onChange={(e) => {
                    setCustomPincode(e.target.value);
                    setCustomError('');
                  }}
                  error={customError}
                  maxLength={6}
                  inputMode="numeric"
                  id="custom-zone-input"
                />
              </div>
              <Button variant="primary" type="submit" className="text-xs">
                Apply Zone
              </Button>
            </div>
          </form>

          <div className="p-3 bg-secondary-50 rounded-xl border border-secondary-200 text-[11px] text-secondary-600">
            <span>Your registered voting pincode is: </span>
            <strong className="text-primary-700 font-bold">{registeredPincode}</strong>
            <span className="block text-[10px] text-secondary-400 mt-0.5">
              (Voting eligibility on complaints requires matching the complaint's pincode)
            </span>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default CitizenNav;
