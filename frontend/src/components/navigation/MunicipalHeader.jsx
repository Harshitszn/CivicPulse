import React from 'react';
import { Bell, Search, LogOut, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function MunicipalHeader({ sidebarCollapsed, onMenuToggle, pageTitle = 'Dashboard' }) {
  const navigate = useNavigate();

  return (
    <header
      className={[
        'fixed top-0 right-0 z-20 flex items-center gap-4 px-6 h-16 shell-panel border-b',
        'transition-all duration-slow',
        sidebarCollapsed ? 'left-16' : 'left-64',
      ].join(' ')}
      style={{ borderColor: 'rgba(255,255,255,0.08)' }}
    >
      {/* Mobile menu toggle */}
      <button
        className="lg:hidden p-1.5 rounded-md text-white/60 hover:text-white hover:bg-white/10 transition-colors"
        onClick={onMenuToggle}
        id="municipal-menu-btn"
        aria-label="Toggle menu"
      >
        <Menu size={20} />
      </button>

      {/* Page title */}
      <h1 className="text-sm font-semibold text-white/90 hidden sm:block">{pageTitle}</h1>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search */}
      <div className="relative hidden md:block">
        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
        <input
          type="search"
          placeholder="Search complaints..."
          id="municipal-search"
          className="w-48 pl-8 pr-3 py-1.5 text-sm rounded-md text-white placeholder-white/30
                     focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all duration-fast"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
        />
      </div>

      {/* Notifications */}
      <button
        id="municipal-notifications-btn"
        className="relative p-2 rounded-md text-white/60 hover:text-white hover:bg-white/10 transition-colors"
        aria-label="Notifications"
      >
        <Bell size={18} />
        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-error rounded-full" />
      </button>

      {/* User badge */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xs font-bold">MO</span>
        </div>
        <div className="hidden md:block">
          <p className="text-xs font-medium text-white/90 leading-tight">Municipal Officer</p>
          <p className="text-[10px] text-white/40 leading-tight">Admin</p>
        </div>
      </div>

      {/* Logout */}
      <button
        id="municipal-logout-btn"
        onClick={() => navigate('/municipal/login')}
        className="p-2 rounded-md text-white/50 hover:text-white hover:bg-white/10 transition-colors"
        aria-label="Logout"
        title="Logout"
      >
        <LogOut size={16} />
      </button>
    </header>
  );
}

export default MunicipalHeader;
