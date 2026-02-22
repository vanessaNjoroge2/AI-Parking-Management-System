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
      <div className="min-h-screen flex flex-col px-6 py-8 max-w-[390px] mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/login')}
          className="flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Driver Login</span>
        </button>

        {/* Logo */}
        <div className="flex items-center gap-3 mb-12">
          <div className="bg-primary p-3 rounded-2xl">
            <ParkingCircle className="w-8 h-8 text-white" />
          </div>
          <span className="text-2xl text-primary">ParkSmart</span>
        </div>

        {/* Form */}
        <div className="flex-1 flex flex-col">
          <h1 className="text-3xl mb-2">{isSignUp ? 'Create Owner Account' : 'Owner Dashboard'}</h1>
          <p className="text-muted-foreground mb-8">
            {isSignUp ? 'Register to manage your parking lots' : 'Manage your parking lots'}
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
                placeholder="Phone"
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
              {isSubmitting ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
            </Button>
          </form>

          {/* Toggle Sign In/Up */}
          <div className="text-center mb-8">
            <span className="text-muted-foreground">
              {isSignUp ? 'Already have an account? ' : 'New parking lot owner? '}
            </span>
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-primary"
            >
              {isSignUp ? 'Sign In' : 'Register Now'}
            </button>
          </div>

          {/* Benefits */}
          <div className="bg-gradient-to-br from-primary to-accent rounded-2xl p-6 text-white">
            <h3 className="text-lg mb-3">Owner Benefits</h3>
            <ul className="space-y-2 text-sm text-white/90">
              <li>• Manage multiple parking lots</li>
              <li>• Real-time booking updates</li>
              <li>• Revenue analytics & insights</li>
              <li>• Automated payment processing</li>
            </ul>
          </div>
        </div>
      </div>
    </MobileFrame>
  );
}
