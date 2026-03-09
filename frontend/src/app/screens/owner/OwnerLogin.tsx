import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { ParkingCircle, Lock, ArrowLeft, Phone, User, Mail } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { MobileFrame } from '../../components/MobileFrame';
import { login, register } from '../../services/auth';

export function OwnerLogin() {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (isSignUp) {
        const response = await register({
          fullName,
          phone,
          email: email || undefined,
          password,
          role: 'OWNER',
        });

        if (response.user.role !== 'OWNER' && response.user.role !== 'ADMIN') {
          setError('This account does not have owner access.');
          return;
        }
        navigate('/owner/dashboard');
      } else {
        const response = await login({ phone, password });
        if (response.user.role !== 'OWNER' && response.user.role !== 'ADMIN') {
          setError('This account does not have owner access.');
          return;
        }
        navigate('/owner/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MobileFrame>
      <div className="min-h-screen flex flex-col">
        {/* Back Button & Header Section */}
        <div className="bg-slate-900 py-10 px-6 flex flex-col items-center justify-center border-b border-slate-800 relative">
          <button
            onClick={() => navigate('/login')}
            className="absolute left-4 top-4 p-2 text-slate-400 hover:text-white transition-colors bg-white/5 rounded-md border border-white/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="bg-blue-600/10 p-4 rounded-lg border border-blue-500/20 mb-4">
            <ParkingCircle className="w-12 h-12 text-blue-500" strokeWidth={1.5} />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-semibold text-white tracking-tight">ParkSmart Owner</h1>
            <p className="text-slate-400 text-sm font-medium">Facility Management Portal</p>
          </div>
        </div>

        {/* Form Section */}
        <div className="flex-1 flex flex-col px-6 py-10 max-w-[390px] mx-auto w-full">
          <div className="text-left mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-2">
              {isSignUp ? 'Create owner account' : 'Owner sign in'}
            </h2>
            <p className="text-slate-500 text-sm">
              {isSignUp ? 'Set up your account to manage parking lots and bookings.' : 'Access your parking operations dashboard.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-6">
            {isSignUp && (
              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Full name"
                    className="pl-11 h-12 bg-slate-50 rounded-md border-slate-200"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Business Phone</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="tel"
                  placeholder="07XX XXX XXX"
                  className="pl-11 h-12 bg-slate-50 rounded-md border-slate-200"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            </div>

            {isSignUp && (
              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Business Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    type="email"
                    placeholder="corporate@facility.com"
                    className="pl-11 h-12 bg-slate-50 rounded-md border-slate-200"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Credential Key</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="pl-11 h-12 bg-slate-50 rounded-md border-slate-200"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-md mb-2">
                <p className="text-sm text-red-600 text-center">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="h-12 rounded-md bg-blue-600 hover:bg-blue-700 text-white mt-4 font-semibold shadow-blue-600/10 shadow-lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Authenticating...' : isSignUp ? 'Create account' : 'Sign in'}
            </Button>
          </form>

          {/* Toggle Sign In/Up */}
          <div className="text-center mb-10">
            <span className="text-slate-500 text-sm">
              {isSignUp ? 'Already have an account? ' : 'Need owner access? '}
            </span>
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-blue-600 font-semibold text-sm hover:underline"
            >
              {isSignUp ? 'Sign in' : 'Create an account'}
            </button>
          </div>

          {/* Benefits Section */}
          <div className="bg-slate-900 rounded-lg p-6 text-white border border-slate-800 shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/10 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2" />
            <h3 className="text-base font-semibold mb-4 text-white flex items-center gap-2 relative z-10">
              <div className="w-1.5 h-4 bg-blue-600 rounded-full" />
              Facility Management
            </h3>
            <ul className="space-y-3 relative z-10">
              {[
                'Enterprise Multi-lot Control',
                'Real-time Occupancy Analytics',
                'Business Revenue Insights',
                'Automated Invoicing System'
              ].map((benefit, idx) => (
                <li key={idx} className="flex items-center gap-3 text-xs text-slate-300 font-medium tracking-tight">
                  <div className="w-1 h-1 bg-blue-500 rounded-full" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </MobileFrame>
  );
}
