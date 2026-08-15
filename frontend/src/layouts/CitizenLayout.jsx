import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import CitizenNav from '../components/navigation/CitizenNav';
import ToastContainer from '../components/ui/ToastContainer';

/**
 * CitizenLayout — FeedLoop-style structure
 * - Mobile-first vertical scroll
 * - Top header (desktop) + bottom tab bar (mobile)
 * - Max content width 640px centered (feed column)
 * - Background: DESIGN.md #F9FAFB
 */
function CitizenLayout() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <CitizenNav />

      {/* Main content — feed column */}
      <main
        className="flex-1 w-full max-w-2xl mx-auto px-4 pt-4 pb-24 md:pb-6"
        id="citizen-main-content"
      >
        <Outlet />
      </main>

      <ToastContainer />
    </div>
  );
}

export default CitizenLayout;
