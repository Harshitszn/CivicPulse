import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, User, Building2, MapPin, ArrowRight, Lock, Mail, Phone, CheckCircle2 } from 'lucide-react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';

export default function MunicipalLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    pincode: '110001',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.email.trim()) {
      errs.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      errs.email = 'Please enter a valid email';
    }

    if (!form.password) {
      errs.password = 'Password is required';
    } else if (form.password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }

    if (mode === 'register') {
      if (!form.name.trim()) errs.name = 'Full name is required';
      if (!form.pincode.trim() || !/^\d{6}$/.test(form.pincode.trim())) {
        errs.pincode = 'Please enter a valid 6-digit postal pincode';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      let user;
      if (mode === 'login') {
        user = await login({
          email: form.email.trim(),
          password: form.password,
        });
      } else {
        user = await register({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || undefined,
          pincode: form.pincode.trim(),
          password: form.password,
        });
      }

      // Role-based routing
      if (user.role === 'official' || user.role === 'staff' || user.role === 'admin') {
        navigate('/municipal/dashboard');
      } else {
        navigate('/feed');
      }
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        submit: err.message || 'Authentication failed. Please check your credentials.',
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-surface">
      {/* Left — Brand Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary-600 flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-white/5 -translate-y-1/4 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full bg-white/5 translate-y-1/4 -translate-x-1/4" />

        <div className="relative z-10 text-center text-white space-y-4 max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mx-auto shadow-raised border border-white/20">
            <Shield size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">CivicPulse Platform</h1>
          <p className="text-base font-semibold text-white/90">
            Unified Citizen Grievance & Municipal Intelligence System
          </p>
          <p className="text-xs text-white/70 leading-relaxed font-medium">
            PostgreSQL + PostGIS secured platform with real-time jurisdictional tracking, AI classification, and cryptographic verification.
          </p>

          <div className="grid grid-cols-3 gap-3 pt-6 text-left">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3.5 border border-white/10">
              <p className="text-lg font-extrabold">PostGIS</p>
              <p className="text-[10px] text-white/70 uppercase font-bold">Spatial Engine</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3.5 border border-white/10">
              <p className="text-lg font-extrabold">JWT</p>
              <p className="text-[10px] text-white/70 uppercase font-bold">Secure Tokens</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3.5 border border-white/10">
              <p className="text-lg font-extrabold">Realtime</p>
              <p className="text-[10px] text-white/70 uppercase font-bold">Civic Stream</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right — Login & Register Container */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile Logo Header */}
          <div className="lg:hidden flex items-center gap-2 mb-2">
            <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center text-white font-extrabold text-sm shadow-xs">
              CP
            </div>
            <span className="font-extrabold text-secondary-900 text-lg">CivicPulse</span>
          </div>

          <div>
            <h2 className="text-2xl font-extrabold text-secondary-900 tracking-tight">
              {mode === 'login' ? 'Welcome Back' : 'Create an Account'}
            </h2>
            <p className="text-xs text-secondary-500 mt-1">
              {mode === 'login'
                ? 'Sign in to access your civic feed, voting, and report dashboard'
                : 'Join your local postal zone to report, upvote, and track civic issues'}
            </p>
          </div>

          {/* Mode Switch Tabs */}
          <div className="flex p-1 bg-secondary-100 rounded-xl border border-secondary-200">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrors({});
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-surface text-primary-700 shadow-xs border border-secondary-200'
                  : 'text-secondary-500 hover:text-secondary-800'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrors({});
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'register'
                  ? 'bg-surface text-primary-700 shadow-xs border border-secondary-200'
                  : 'text-secondary-500 hover:text-secondary-800'
              }`}
            >
              Register New Citizen
            </button>
          </div>

          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
              {errors.submit}
            </div>
          )}

          {/* Authentication Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {mode === 'register' && (
              <Input
                label="Full Name"
                type="text"
                placeholder="e.g. Ananya Sharma"
                value={form.name}
                onChange={(e) => {
                  setForm((f) => ({ ...f, name: e.target.value }));
                  setErrors((err) => ({ ...err, name: '' }));
                }}
                error={errors.name}
                id="auth-name-input"
                required
              />
            )}

            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => {
                setForm((f) => ({ ...f, email: e.target.value }));
                setErrors((err) => ({ ...err, email: '', submit: '' }));
              }}
              error={errors.email}
              id="auth-email-input"
              required
            />

            {mode === 'register' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Phone Number (Optional)"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  id="auth-phone-input"
                />
                <Input
                  label="Resident Pincode (6-digit)"
                  type="text"
                  maxLength={6}
                  placeholder="e.g. 110001"
                  value={form.pincode}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, pincode: e.target.value }));
                    setErrors((err) => ({ ...err, pincode: '' }));
                  }}
                  error={errors.pincode}
                  id="auth-pincode-input"
                  required
                />
              </div>
            )}

            <Input
              label="Password"
              type="password"
              placeholder="Minimum 6 characters"
              value={form.password}
              onChange={(e) => {
                setForm((f) => ({ ...f, password: e.target.value }));
                setErrors((err) => ({ ...err, password: '', submit: '' }));
              }}
              error={errors.password}
              id="auth-password-input"
              required
            />

            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={loading}
              size="lg"
              className="font-extrabold text-sm py-3 mt-2"
            >
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          <p className="text-center text-[11px] text-secondary-400 font-medium">
            Protected with bcrypt password hashing & JWT token authentication.
          </p>
        </div>
      </div>
    </div>
  );
}
