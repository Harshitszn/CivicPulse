import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Rss, PlusCircle, FileText, User } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/',             label: 'Home',       icon: Home,       id: 'nav-home'     },
  { to: '/feed',         label: 'Feed',        icon: Rss,        id: 'nav-feed'     },
  { to: '/report',       label: 'Report',      icon: PlusCircle, id: 'nav-report'   },
  { to: '/my-complaints',label: 'Mine',        icon: FileText,   id: 'nav-mine'     },
  { to: '/profile',      label: 'Profile',     icon: User,       id: 'nav-profile'  },
];

function CitizenNav() {
  return (
    <>
      {/* ── Top Header (desktop) ─────────────────────────────────────────── */}
      <header className="hidden md:flex items-center justify-between px-6 h-14 bg-surface border-b border-secondary-200 sticky top-0 z-40">
        <NavLink to="/" className="flex items-center gap-2 no-underline">
          <span className="w-7 h-7 rounded-lg bg-primary-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">CP</span>
          </span>
          <span className="text-base font-bold text-secondary-800">CivicPulse</span>
        </NavLink>

        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon, id }) => (
            <NavLink
              key={to}
              to={to}
              id={id}
              end={to === '/'}
              className={({ isActive }) =>
                [
                  'flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-fast no-underline',
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-secondary-500 hover:text-secondary-700 hover:bg-secondary-100',
                ].join(' ')
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>
      </header>

      {/* ── Mobile Top Bar ───────────────────────────────────────────────── */}
      <header className="md:hidden flex items-center justify-between px-4 h-14 bg-surface border-b border-secondary-200 sticky top-0 z-40">
        <NavLink to="/" className="flex items-center gap-2 no-underline">
          <span className="w-7 h-7 rounded-lg bg-primary-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">CP</span>
          </span>
          <span className="text-sm font-bold text-secondary-800">CivicPulse</span>
        </NavLink>
      </header>

      {/* ── Mobile Bottom Nav ────────────────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface border-t border-secondary-200 flex items-stretch">
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
                  ? 'text-primary-600'
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
    </>
  );
}

export default CitizenNav;
