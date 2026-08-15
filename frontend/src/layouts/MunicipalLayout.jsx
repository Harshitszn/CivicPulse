import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import MunicipalSidebar from '../components/navigation/MunicipalSidebar';
import MunicipalHeader from '../components/navigation/MunicipalHeader';
import ToastContainer from '../components/ui/ToastContainer';

const PAGE_TITLES = {
  '/municipal/dashboard':   'Dashboard',
  '/municipal/complaints':  'Complaints',
  '/municipal/map':         'Map View',
  '/municipal/departments': 'Departments',
  '/municipal/analytics':   'Analytics',
  '/municipal/citizens':    'Citizens',
  '/municipal/settings':    'Settings',
};

/**
 * MunicipalLayout — Command Center sidebar+header structure, DESIGN.md visual identity
 * - Dark-glass sidebar (256px / 64px collapsed) from MUNICIPAL_DESIGN.md layout spec
 * - Dark-glass header (64px) from MUNICIPAL_DESIGN.md layout spec
 * - Light warm workspace content area (#F9FAFB) from DESIGN.md
 * - All colors: DESIGN.md blue primary
 */
function MunicipalLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const pageTitle =
    Object.entries(PAGE_TITLES).find(([path]) => location.pathname.startsWith(path))?.[1] ?? 'CivicPulse';

  const sidebarMargin = collapsed ? 'ml-16' : 'ml-64';

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <MunicipalSidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />

      {/* Right panel: header + content */}
      <div className={`flex-1 flex flex-col transition-all duration-slow ${sidebarMargin}`}>
        {/* Header */}
        <MunicipalHeader sidebarCollapsed={collapsed} pageTitle={pageTitle} />

        {/* Content */}
        <main
          className="flex-1 mt-16 p-6 overflow-y-auto"
          id="municipal-main-content"
        >
          <div className="max-w-container mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      <ToastContainer />
    </div>
  );
}

export default MunicipalLayout;
