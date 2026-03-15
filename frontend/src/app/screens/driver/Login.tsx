import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ParkingCircle, Mail, Lock, User, Phone } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { MobileFrame } from '../../components/MobileFrame';
import { login, register } from '../../services/auth';
import { getStoredAuth } from '../../services/authStorage';


export function Login() {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [fullName, setFullName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectAuthenticatedUser = React.useCallback(() => {
    const auth = getStoredAuth();
    if (!auth) return false;

    if (auth.user.role === 'OWNER' || auth.user.role === 'ADMIN') {
      navigate('/owner/dashboard');
      return true;
    }

    navigate('/search');
    return true;
  }, [navigate]);

  React.useEffect(() => {
    redirectAuthenticatedUser();
  }, [redirectAuthenticatedUser]);

  const validateInputs = () => {
    if (isSignUp && !fullName.trim()) {
      setError('Full name is required');
      return false;
    }
    if (!identifier.trim()) {
      setError(isSignUp ? 'Phone number is required' : 'Email or phone number is required');
      return false;
    }
    if (isSignUp) {
      const phoneRegex = /^(?:254|\+254|0)?(7|1)\d{8}$/;
      if (!phoneRegex.test(identifier.replace(/\s/g, ''))) {
        setError('Please enter a valid Kenyan phone number (e.g. 07XXXXXXXX)');
        return false;
      }
    }
    if (isSignUp && email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInputs()) return;

    setError('');
    setIsSubmitting(true);

    try {
      if (isSignUp) {
        await register({
          fullName,
          phone: identifier,
          email: email || undefined,
          password,
          role: 'DRIVER',
        });
      } else {
        await login({ identifier, password });
      }

      redirectAuthenticatedUser();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to authenticate');
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <MobileFrame>
      <div className="min-h-screen flex flex-col">
        {/* Decorative Top Section */}
        <div className="bg-slate-900 py-12 px-6 flex flex-col items-center justify-center border-b border-slate-800">
          <div className="bg-blue-600/10 p-4 rounded-lg border border-blue-500/20 mb-4">
            <ParkingCircle className="w-12 h-12 text-blue-500" strokeWidth={1.5} />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-semibold text-white tracking-tight">ParkSmart</h1>
            <p className="text-slate-400 text-sm font-medium">Urban Mobility Solutions</p>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 flex flex-col px-6 py-10 max-w-[390px] mx-auto w-full">
          <div className="text-left mb-10">
            <h2 className="text-3xl font-semibold text-slate-900 mb-2">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-slate-500">
              {isSignUp ? 'Join the urban parking network' : 'Sign in to your driver profile'}
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
                    placeholder="Enter your name"
                    className="pl-11 h-12 bg-slate-50 rounded-md border-slate-200"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                {isSignUp ? 'Phone Number' : 'Email or Phone Number'}
              </label>
              <div className="relative">
                {isSignUp ? (
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                ) : (
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                )}
                <Input
                  type={isSignUp ? 'tel' : 'text'}
                  placeholder={isSignUp ? '07XX XXX XXX' : 'Enter email or 07XX XXX XXX'}
                  className="pl-11 h-12 bg-slate-50 rounded-md border-slate-200"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                />
              </div>
            </div>

            {isSignUp && (
              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email (Optional)</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    className="pl-11 h-12 bg-slate-50 rounded-md border-slate-200"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Security Key</label>
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

            {!isSignUp && (
              <button type="button" className="text-blue-600 font-semibold text-sm text-right hover:text-blue-700">
                Recover access?
              </button>
            )}

            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-md">
                <p className="text-sm text-red-600 text-center">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="h-12 rounded-md bg-blue-600 hover:bg-blue-700 text-white mt-4 font-semibold shadow-blue-600/10 shadow-lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Verifying Account...' : isSignUp ? 'Register as Driver' : 'Sign in to ParkSmart'}
            </Button>
          </form>

          {/* Toggle Sign In/Up */}
          <div className="text-center mb-8">
            <span className="text-slate-500 text-sm">
              {isSignUp ? 'Already on ParkSmart? ' : "New to the platform? "}
            </span>
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-blue-600 font-semibold text-sm hover:underline"
            >
              {isSignUp ? 'Sign In' : 'Join Now'}
            </button>
          </div>

          {/* Owner Login Link */}
          <div className="mt-auto pt-8 text-center border-t border-slate-100">
            <button
              onClick={() => navigate('/owner/login')}
              className="text-slate-400 hover:text-blue-600 text-sm transition-colors"
            >
              Manage a parking facility? <span className="text-blue-600 font-semibold">Switch to Owner</span>
            </button>
          </div>
        </div>
      </div>
    </MobileFrame>
  );
}