import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Map, Building2, BarChart3, Users, Settings,
  ChevronLeft, ChevronRight, Activity, ShieldCheck,
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/municipal/dashboard',   label: 'Dashboard',   icon: LayoutDashboard, id: 'mnav-dashboard'   },
  { to: '/municipal/complaints',  label: 'Complaints',  icon: FileText,        id: 'mnav-complaints'  },
  { to: '/municipal/map',         label: 'GIS Map',     icon: Map,             id: 'mnav-map'         },
  { to: '/municipal/departments', label: 'Departments', icon: Building2,       id: 'mnav-departments' },
  { to: '/municipal/analytics',   label: 'Analytics',   icon: BarChart3,       id: 'mnav-analytics'   },
  { to: '/municipal/citizens',    label: 'Citizens',    icon: Users,           id: 'mnav-citizens'    },
  { to: '/municipal/settings',    label: 'Settings',    icon: Settings,        id: 'mnav-settings'    },
];

function MunicipalSidebar({ collapsed, onToggle, mobileOpen, onCloseMobile }) {
  return (
    <aside
      className={[
        'fixed left-0 top-0 bottom-0 z-40 flex flex-col bg-white border-r border-secondary-200 shadow-card',
        'transition-all duration-300 transform',
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        collapsed ? 'w-64 lg:w-16' : 'w-64',
      ].join(' ')}
    >
      {/* Logo Container */}
      <div className={`flex items-center h-16 border-b border-secondary-100 px-4 flex-shrink-0 ${collapsed ? 'justify-center' : 'gap-3'}`}>
        <div className="w-9 h-9 rounded-xl bg-primary-600 shadow-sm flex items-center justify-center flex-shrink-0 text-white font-extrabold text-sm tracking-tight">
          CP
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <span className="text-secondary-900 font-extrabold text-base leading-tight block tracking-tight">
              CivicPulse
            </span>
            <span className="text-primary-600 font-bold text-[10px] uppercase tracking-wider block">
              Command Center
            </span>
          </div>
        )}
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon, id }) => (
          <NavLink
            key={to}
            to={to}
            id={id}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-fast no-underline group font-bold text-xs',
                collapsed ? 'justify-center' : '',
                isActive
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-secondary-600 hover:bg-secondary-100/80 hover:text-secondary-900',
              ].join(' ')
            }
            title={collapsed ? label : undefined}
          >
            <Icon size={18} className="flex-shrink-0" />
            {!collapsed && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer System Status Badge & Collapse Toggle */}
      <div className="p-3 border-t border-secondary-100 flex-shrink-0 space-y-2">
        {!collapsed && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <div className="text-[11px] leading-tight">
              <p className="font-bold text-emerald-900">System Operational</p>
              <p className="text-[10px] text-emerald-700 font-medium">All 6 Wards Connected</p>
            </div>
          </div>
        )}

        <button
          onClick={onToggle}
          id="sidebar-collapse-btn"
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-secondary-500 hover:text-secondary-900 hover:bg-secondary-100 transition-colors text-xs font-semibold"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : (
            <>
              <ChevronLeft size={16} />
              <span>Collapse Sidebar</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}

export default MunicipalSidebar;
