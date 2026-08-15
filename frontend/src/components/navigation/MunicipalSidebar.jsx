import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Map, Building2, BarChart3, Users, Settings,
  ChevronLeft, ChevronRight,
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/municipal/dashboard',   label: 'Dashboard',   icon: LayoutDashboard, id: 'mnav-dashboard'   },
  { to: '/municipal/complaints',  label: 'Complaints',  icon: FileText,        id: 'mnav-complaints'  },
  { to: '/municipal/map',         label: 'Map View',    icon: Map,             id: 'mnav-map'         },
  { to: '/municipal/departments', label: 'Departments', icon: Building2,       id: 'mnav-departments' },
  { to: '/municipal/analytics',   label: 'Analytics',   icon: BarChart3,       id: 'mnav-analytics'   },
  { to: '/municipal/citizens',    label: 'Citizens',    icon: Users,           id: 'mnav-citizens'    },
  { to: '/municipal/settings',    label: 'Settings',    icon: Settings,        id: 'mnav-settings'    },
];

function MunicipalSidebar({ collapsed, onToggle }) {
  return (
    <aside
      className={[
        'fixed left-0 top-0 bottom-0 z-30 flex flex-col shell-panel border-r',
        'transition-all duration-slow',
        collapsed ? 'w-16' : 'w-64',
      ].join(' ')}
      style={{ borderColor: 'rgba(255,255,255,0.08)' }}
    >
      {/* Logo */}
      <div className={`flex items-center h-16 border-b px-4 flex-shrink-0 ${collapsed ? 'justify-center' : 'gap-3'}`}
           style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xs font-bold">CP</span>
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-white font-bold text-sm leading-tight">CivicPulse</p>
            <p className="text-white/40 text-[10px]">Municipal Portal</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {NAV_ITEMS.map(({ to, label, icon: Icon, id }) => (
          <NavLink
            key={to}
            to={to}
            id={id}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 px-3 py-2.5 rounded-md mb-0.5 transition-all duration-fast no-underline group',
                collapsed ? 'justify-center' : '',
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'text-white/60 hover:bg-white/10 hover:text-white',
              ].join(' ')
            }
            title={collapsed ? label : undefined}
          >
            <Icon size={18} className="flex-shrink-0" />
            {!collapsed && <span className="text-sm font-medium truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Collapse toggle */}
      <div className="p-3 border-t flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <button
          onClick={onToggle}
          id="sidebar-collapse-btn"
          className={[
            'w-full flex items-center justify-center gap-2 py-2 rounded-md text-white/50',
            'hover:text-white hover:bg-white/10 transition-colors duration-fast text-xs',
          ].join(' ')}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : (
            <>
              <ChevronLeft size={16} />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}

export default MunicipalSidebar;
