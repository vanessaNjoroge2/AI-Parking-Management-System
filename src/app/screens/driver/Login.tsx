import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { ParkingCircle, Mail, Lock, User } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { MobileFrame } from '../../components/MobileFrame';

export function Login() {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/search');
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
                />
              </div>
            )}
            
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Email"
                className="pl-12 h-14 bg-input-background rounded-2xl border-0"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="password"
                placeholder="Password"
                className="pl-12 h-14 bg-input-background rounded-2xl border-0"
              />
            </div>

            {!isSignUp && (
              <button type="button" className="text-primary text-sm text-right">
                Forgot password?
              </button>
            )}

            <Button
              type="submit"
              className="h-14 rounded-2xl bg-primary text-white mt-4"
            >
              {isSignUp ? 'Sign Up' : 'Sign In'}
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