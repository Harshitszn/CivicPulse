import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';

// Layouts
import CitizenLayout from './layouts/CitizenLayout';
import MunicipalLayout from './layouts/MunicipalLayout';

// Citizen pages
import Home           from './pages/citizen/Home';
import Feed           from './pages/citizen/Feed';
import Report         from './pages/citizen/Report';
import ComplaintDetail from './pages/citizen/ComplaintDetail';
import MyComplaints   from './pages/citizen/MyComplaints';
import Profile        from './pages/citizen/Profile';

// Municipal pages
import MunicipalLogin           from './pages/municipal/Login';
import Dashboard                from './pages/municipal/Dashboard';
import MunicipalComplaints      from './pages/municipal/Complaints';
import MunicipalComplaintDetail from './pages/municipal/ComplaintDetail';
import MapView                  from './pages/municipal/Map';
import Departments              from './pages/municipal/Departments';
import Analytics                from './pages/municipal/Analytics';
import Citizens                 from './pages/municipal/Citizens';
import Settings                 from './pages/municipal/Settings';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Routes>
          {/* ── Citizen routes ──────────────────────────────────────────── */}
          <Route element={<CitizenLayout />}>
            <Route path="/"               element={<Home />}             />
            <Route path="/feed"           element={<Feed />}             />
            <Route path="/report"         element={<Report />}           />
            <Route path="/complaint/:id"  element={<ComplaintDetail />}  />
            <Route path="/my-complaints"  element={<MyComplaints />}     />
            <Route path="/profile"        element={<Profile />}          />
          </Route>

          {/* ── Municipal login (no layout wrapper) ─────────────────────── */}
          <Route path="/municipal/login" element={<MunicipalLogin />} />

          {/* ── Municipal routes (inside MunicipalLayout) ───────────────── */}
          <Route path="/municipal" element={<MunicipalLayout />}>
            <Route index element={<Navigate to="/municipal/dashboard" replace />} />
            <Route path="dashboard"       element={<Dashboard />}                />
            <Route path="complaints"      element={<MunicipalComplaints />}      />
            <Route path="complaints/:id"  element={<MunicipalComplaintDetail />} />
            <Route path="map"             element={<MapView />}                  />
            <Route path="departments"     element={<Departments />}              />
            <Route path="analytics"       element={<Analytics />}               />
            <Route path="citizens"        element={<Citizens />}                 />
            <Route path="settings"        element={<Settings />}                 />
          </Route>

          {/* ── 404 fallback ────────────────────────────────────────────── */}
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center bg-background">
              <div className="text-center">
                <p className="text-6xl font-bold text-primary-600 mb-2">404</p>
                <p className="text-secondary-500 text-sm mb-4">Page not found</p>
                <a href="/" className="text-primary-600 text-sm hover:underline">Go home →</a>
              </div>
            </div>
          } />
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  );
}
