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
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (getStoredAuth()) {
      navigate('/search');
    }
  }, [navigate]);

  const validateInputs = () => {
    if (isSignUp && !fullName.trim()) {
      setError('Full name is required');
      return false;
    }
    if (!phone.trim()) {
      setError('Phone number is required');
      return false;
    }
    const phoneRegex = /^(?:254|\+254|0)?(7|1)\d{8}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      setError('Please enter a valid Kenyan phone number (e.g. 07XXXXXXXX)');
      return false;
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
          phone,
          email: email || undefined,
          password,
          role: 'DRIVER',
        });
      } else {
        await login({ phone, password });
      }

      navigate('/search');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to authenticate');
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <MobileFrame>
      <div className="min-h-screen flex flex-col px-6 py-8 max-w-[390px] mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-12 mt-8">
          <div className="bg-primary p-3 rounded-2xl">
            <ParkingCircle className="w-8 h-8 text-white" />
          </div>
          <span className="text-2xl text-primary">ParkSmart</span>
        </div>

        {/* Form */}
        <div className="flex-1 flex flex-col">
          <h1 className="text-3xl mb-2">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="text-muted-foreground mb-8">
            {isSignUp ? 'Sign up to get started' : 'Sign in to continue'}
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-6">
            {isSignUp && (
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Full Name"
                  className="pl-12 h-14 bg-input-background rounded-2xl border-0"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="tel"
                placeholder="Phone (e.g. 07XX XXX XXX)"
                className="pl-12 h-14 bg-input-background rounded-2xl border-0"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            {isSignUp && (
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Email (optional)"
                  className="pl-12 h-14 bg-input-background rounded-2xl border-0"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            )}

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="password"
                placeholder="Password"
                className="pl-12 h-14 bg-input-background rounded-2xl border-0"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {!isSignUp && (
              <button type="button" className="text-primary text-sm text-right">
                Forgot password?
              </button>
            )}

            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}

            <Button
              type="submit"
              className="h-14 rounded-2xl bg-primary text-white mt-4"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Please wait...' : isSignUp ? 'Sign Up' : 'Sign In'}
            </Button>
          </form>

          {/* Toggle Sign In/Up */}
          <div className="text-center">
            <span className="text-muted-foreground">
              {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            </span>
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-primary"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </div>

          {/* Owner Login Link */}
          <div className="mt-auto pt-8 text-center border-t border-border">
            <button
              onClick={() => navigate('/owner/login')}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Are you a parking lot owner?
            </button>
          </div>
        </div>
      </div>
    </MobileFrame>
  );
}