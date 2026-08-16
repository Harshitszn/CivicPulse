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
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const pageTitle =
    Object.entries(PAGE_TITLES).find(([path]) => location.pathname.startsWith(path))?.[1] ?? 'CivicPulse';

  return (
    <div className="min-h-screen bg-background flex overflow-x-hidden">
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-secondary-900/50 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <MunicipalSidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Right panel: header + content */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-slow ${
        collapsed ? 'lg:ml-16' : 'lg:ml-64'
      }`}>
        {/* Header */}
        <MunicipalHeader
          sidebarCollapsed={collapsed}
          onMenuToggle={() => setMobileOpen((prev) => !prev)}
          pageTitle={pageTitle}
        />

        {/* Content Workspace */}
        <main
          className="flex-1 mt-16 p-4 sm:p-6 lg:p-8 overflow-y-auto"
          id="municipal-main-content"
        >
          <div className="w-full max-w-[1600px] mx-auto min-w-0">
            <Outlet />
          </div>
        </main>
      </div>

      <ToastContainer />
    </div>
  );
}

export default MunicipalLayout;
