import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, User, Building2, MapPin, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';
import { usePincode, DEMO_USERS } from '../../context/PincodeContext';

export default function MunicipalLogin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { loginAsUser } = usePincode();

  const [form, setForm] = useState({ email: 'officer@demo.com', password: 'demo' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Perform login based on email
  const handlePerformLogin = async (targetEmail) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    setLoading(false);

    const user = loginAsUser(targetEmail);
    if (user.role === 'officer') {
      navigate('/municipal/dashboard');
    } else {
      navigate('/feed');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.email.trim()) {
      setErrors({ email: 'Please enter an email' });
      return;
    }
    handlePerformLogin(form.email);
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
          <p className="text-base font-semibold text-white/90">Unified Citizen Grievance & Municipal Management System</p>
          <p className="text-xs text-white/70 leading-relaxed font-medium">
            College Demonstration Mode • Simulated authentication with 1-click user persona switching.
          </p>

          <div className="grid grid-cols-3 gap-3 pt-6 text-left">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3.5 border border-white/10">
              <p className="text-lg font-extrabold">400064</p>
              <p className="text-[10px] text-white/70 uppercase font-bold">Primary Pincode</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3.5 border border-white/10">
              <p className="text-lg font-extrabold">400076</p>
              <p className="text-[10px] text-white/70 uppercase font-bold">Secondary Zone</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3.5 border border-white/10">
              <p className="text-lg font-extrabold">5 Depts</p>
              <p className="text-[10px] text-white/70 uppercase font-bold">Municipal Ops</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right — Login Form & Quick Demo Persona Switcher */}
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
            <span className="px-2.5 py-1 bg-primary-50 text-primary-700 text-xs font-extrabold rounded-full border border-primary-200 inline-block mb-2">
              COLLEGE DEMO MODE
            </span>
            <h2 className="text-2xl font-extrabold text-secondary-900 tracking-tight">Portal Authentication</h2>
            <p className="text-xs text-secondary-500 mt-1">Select a demo user persona below or enter credentials</p>
          </div>

          {/* ⚡ Quick Demo Persona Switcher Section */}
          <div className="bg-gradient-to-br from-primary-50/80 to-indigo-50/60 border border-primary-200 rounded-2xl p-4 space-y-3 shadow-card">
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-primary-800 border-b border-primary-100 pb-2">
              <Zap size={15} className="text-primary-600 fill-current" />
              <span>1-Click College Demo Logins</span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {DEMO_USERS.map((u) => {
                const isOfficer = u.role === 'officer';
                return (
                  <button
                    key={u.email}
                    onClick={() => handlePerformLogin(u.email)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between group ${
                      isOfficer
                        ? 'bg-primary-600 text-white border-primary-600 hover:bg-primary-700 shadow-sm'
                        : 'bg-white text-secondary-900 border-secondary-200 hover:border-primary-400 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                        isOfficer ? 'bg-white/20 text-white' : 'bg-primary-50 text-primary-700'
                      }`}>
                        {isOfficer ? <Building2 size={16} /> : <User size={16} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-extrabold">{u.name}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                            isOfficer ? 'bg-white/20 text-white' : 'bg-secondary-100 text-secondary-600'
                          }`}>
                            {isOfficer ? 'Officer' : `PIN: ${u.pincode}`}
                          </span>
                        </div>
                        <span className={`text-[11px] font-mono block mt-0.5 ${
                          isOfficer ? 'text-white/80' : 'text-secondary-400'
                        }`}>
                          {u.email}
                        </span>
                      </div>
                    </div>

                    <ArrowRight size={15} className={`transition-transform group-hover:translate-x-1 ${
                      isOfficer ? 'text-white' : 'text-primary-600'
                    }`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Standard Form Input */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4 pt-1">
            <Input
              label="Demo Account Email"
              type="email"
              placeholder="officer@demo.com or citizen@demo.com"
              value={form.email}
              onChange={(e) => { setForm((f) => ({ ...f, email: e.target.value })); setErrors({}); }}
              error={errors.email}
              id="demo-email-input"
            />

            <Input
              label="Password (Optional for Demo)"
              type="password"
              placeholder="No password required"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              id="demo-password-input"
            />

            <Button type="submit" variant="primary" fullWidth loading={loading} size="lg" className="font-extrabold text-sm py-3">
              Sign In to Selected Persona
            </Button>
          </form>

          <p className="text-center text-[11px] text-secondary-400 font-medium">
            Simulated demonstration environment • Maintains session state during presentation
          </p>
        </div>
      </div>
    </div>
  );
}
