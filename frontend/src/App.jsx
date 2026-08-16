import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { PincodeProvider } from './context/PincodeContext';

// Layouts
import CitizenLayout from './layouts/CitizenLayout';
import MunicipalLayout from './layouts/MunicipalLayout';

// Citizen pages
const Home = lazy(() => import('./pages/citizen/Home'));
const Feed = lazy(() => import('./pages/citizen/Feed'));
const Report = lazy(() => import('./pages/citizen/Report'));
const ComplaintDetail = lazy(() => import('./pages/citizen/ComplaintDetail'));
const MyComplaints = lazy(() => import('./pages/citizen/MyComplaints'));
const Profile = lazy(() => import('./pages/citizen/Profile'));
const CivicInsights = lazy(() => import('./pages/citizen/CivicInsights'));

// Municipal pages
const MunicipalLogin = lazy(() => import('./pages/municipal/Login'));
const Dashboard = lazy(() => import('./pages/municipal/Dashboard'));
const MunicipalComplaints = lazy(() => import('./pages/municipal/Complaints'));
const MunicipalComplaintDetail = lazy(() => import('./pages/municipal/ComplaintDetail'));
const MapView = lazy(() => import('./pages/municipal/Map'));
const Departments = lazy(() => import('./pages/municipal/Departments'));
const Analytics = lazy(() => import('./pages/municipal/Analytics'));
const Citizens = lazy(() => import('./pages/municipal/Citizens'));
const Settings = lazy(() => import('./pages/municipal/Settings'));

const loadingFallback = (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center">
      <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      <p className="mt-4 text-sm font-semibold text-secondary-600">Loading page...</p>
    </div>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <PincodeProvider>
          <Suspense fallback={loadingFallback}>
            <Routes>
              {/* ── Citizen routes ──────────────────────────────────────────── */}
              <Route element={<CitizenLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/feed" element={<Feed />} />
                <Route path="/report" element={<Report />} />
                <Route path="/complaint/:id" element={<ComplaintDetail />} />
                <Route path="/my-complaints" element={<MyComplaints />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/insights" element={<CivicInsights />} />
                <Route path="/insights/record" element={<CivicInsights />} />
                <Route path="/insights/services" element={<CivicInsights />} />
              </Route>

              {/* ── Municipal login (no layout wrapper) ─────────────────────── */}
              <Route path="/municipal/login" element={<MunicipalLogin />} />

              {/* ── Municipal routes (inside MunicipalLayout) ───────────────── */}
              <Route path="/municipal" element={<MunicipalLayout />}>
                <Route index element={<Navigate to="/municipal/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="complaints" element={<MunicipalComplaints />} />
                <Route path="complaints/:id" element={<MunicipalComplaintDetail />} />
                <Route path="map" element={<MapView />} />
                <Route path="departments" element={<Departments />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="citizens" element={<Citizens />} />
                <Route path="settings" element={<Settings />} />
              </Route>

              {/* ── 404 fallback ────────────────────────────────────────────── */}
              <Route
                path="*"
                element={
                  <div className="min-h-screen flex items-center justify-center bg-background">
                    <div className="text-center">
                      <p className="text-6xl font-bold text-primary-600 mb-2">404</p>
                      <p className="text-secondary-500 text-sm mb-4">Page not found</p>
                      <a href="/" className="text-primary-600 text-sm hover:underline">Go home →</a>
                    </div>
                  </div>
                }
              />
            </Routes>
          </Suspense>
        </PincodeProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
