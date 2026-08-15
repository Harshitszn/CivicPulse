import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff } from 'lucide-react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';

export default function MunicipalLogin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.email)    errs.email    = 'Email is required';
    if (!form.password) errs.password = 'Password is required';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    // Dummy auth — any credentials work
    toast.success('Welcome, Municipal Officer!');
    navigate('/municipal/dashboard');
  };

  return (
    <div className="min-h-screen flex">
      {/* Left — Brand panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary-600 flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 -translate-y-1/4 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/5 translate-y-1/4 -translate-x-1/4" />

        <div className="relative z-10 text-center text-white">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-6">
            <Shield size={28} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-3">CivicPulse</h1>
          <p className="text-lg font-medium text-white/80 mb-2">Municipal Operations Portal</p>
          <p className="text-sm text-white/60 max-w-xs mx-auto leading-relaxed">
            Manage civic complaints, track department performance, and serve your citizens better.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-10">
            {[['2,847', 'Total Reports'], ['87%', 'Resolution Rate'], ['18', 'Departments']].map(([val, label]) => (
              <div key={label} className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <p className="text-xl font-bold">{val}</p>
                <p className="text-xs text-white/60 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — Login form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">CP</span>
            </div>
            <span className="font-bold text-secondary-800">CivicPulse</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-secondary-900">Officer Login</h2>
            <p className="text-sm text-secondary-400 mt-1">Sign in to access the municipal portal.</p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <Input
              label="Official Email"
              type="email"
              placeholder="officer@municipality.gov.in"
              value={form.email}
              onChange={(e) => { setForm((f) => ({ ...f, email: e.target.value })); setErrors((er) => ({ ...er, email: undefined })); }}
              error={errors.email}
              id="municipal-email"
              autoComplete="email"
            />
            <div>
              <Input
                label="Password"
                type={showPw ? 'text' : 'password'}
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) => { setForm((f) => ({ ...f, password: e.target.value })); setErrors((er) => ({ ...er, password: undefined })); }}
                error={errors.password}
                id="municipal-password"
                autoComplete="current-password"
                iconRight={showPw ? EyeOff : Eye}
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                className="sr-only"
              />
            </div>

            <div className="text-right">
              <button type="button" className="text-xs text-primary-600 hover:text-primary-700 transition-colors">
                Forgot password?
              </button>
            </div>

            <Button type="submit" variant="primary" fullWidth loading={loading} size="lg">
              Sign In
            </Button>
          </form>

          <p className="text-center text-xs text-secondary-400 mt-6">
            Authorised personnel only. All access is logged.
          </p>
        </div>
      </div>
    </div>
  );
}
