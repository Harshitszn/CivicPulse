import React from 'react';
import { Bell, Search, LogOut, Menu, ShieldCheck, MapPin, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePincode } from '../../context/PincodeContext';

function MunicipalHeader({ sidebarCollapsed, onMenuToggle, pageTitle = 'Dashboard' }) {
  const navigate = useNavigate();
  const { currentUser, loginAsUser, logoutUser, DEMO_USERS } = usePincode();

  const handleLogout = () => {
    logoutUser();
    navigate('/municipal/login');
  };

  return (
    <header
      className={[
        'fixed top-0 right-0 z-20 flex items-center gap-4 px-6 h-16 bg-white border-b border-secondary-200 shadow-xs',
        'transition-all duration-slow',
        sidebarCollapsed ? 'left-16' : 'left-64',
      ].join(' ')}
    >
      {/* Mobile menu toggle */}
      <button
        className="lg:hidden p-2 rounded-lg text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 transition-colors"
        onClick={onMenuToggle}
        id="municipal-menu-btn"
        aria-label="Toggle menu"
      >
        <Menu size={20} />
      </button>

      {/* Page title + Zone badge */}
      <div className="hidden sm:flex items-center gap-3">
        <h1 className="text-base font-extrabold text-secondary-900 tracking-tight">{pageTitle}</h1>
        <span className="text-[11px] font-bold text-primary-700 bg-primary-50 px-2.5 py-0.5 rounded-full border border-primary-200 flex items-center gap-1">
          <MapPin size={11} className="text-primary-600" />
          Central Municipal Zone
        </span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Demo Persona Switcher Dropdown */}
      <div className="hidden sm:flex items-center gap-1.5 bg-primary-50 px-2.5 py-1 rounded-lg border border-primary-200 text-xs">
        <span className="text-[10px] font-extrabold text-primary-800 uppercase">Demo Persona:</span>
        <select
          value={currentUser?.email || 'officer@demo.com'}
          onChange={(e) => {
            const u = loginAsUser(e.target.value);
            if (u.role === 'citizen') window.location.href = '/feed';
          }}
          className="bg-white border border-primary-300 text-secondary-900 text-xs font-extrabold rounded px-2 py-0.5 focus:outline-none cursor-pointer shadow-xs"
        >
          {(DEMO_USERS || []).map((u) => (
            <option key={u.email} value={u.email}>
              {u.name} ({u.role === 'officer' ? 'Officer' : `PIN ${u.pincode}`})
            </option>
          ))}
        </select>
      </div>

      {/* Emergency Alert / Notification Bell */}
      <button
        id="municipal-notifications-btn"
        className="relative p-2 rounded-xl text-secondary-600 hover:text-primary-600 hover:bg-secondary-100 transition-colors min-h-[40px] flex items-center justify-center"
        aria-label="Notifications"
        title="3 Urgent Alerts"
      >
        <Bell size={18} />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full ring-2 ring-white" />
      </button>

      {/* Officer User Profile Badge */}
      <div className="flex items-center gap-2.5 pl-2 border-l border-secondary-200">
        <div className="w-9 h-9 rounded-xl bg-primary-600 text-white font-extrabold text-xs flex items-center justify-center shadow-xs flex-shrink-0">
          {currentUser?.role === 'officer' ? 'MO' : 'CZ'}
        </div>
        <div className="hidden md:block">
          <p className="text-xs font-bold text-secondary-900 leading-tight">
            {currentUser?.name || 'Officer Rajesh V.'}
          </p>
          <p className="text-[10px] font-semibold text-secondary-400 leading-tight">
            {currentUser?.role === 'officer' ? 'Municipal Officer' : `Resident (${currentUser?.pincode})`}
          </p>
        </div>
      </div>

      {/* Portal Logout */}
      <button
        id="municipal-logout-btn"
        onClick={handleLogout}
        className="p-2 rounded-xl text-secondary-400 hover:text-error hover:bg-red-50 transition-colors"
        aria-label="Logout"
        title="Logout of Municipal Command Center"
      >
        <LogOut size={18} />
      </button>
    </header>
  );
}

export default MunicipalHeader;
