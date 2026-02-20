import React from 'react';
import { useNavigate } from 'react-router';
import { ParkingCircle, Mail, Lock, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

export function OwnerLogin() {
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/owner/dashboard');
  };

  return (
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
        <h1 className="text-3xl mb-2">Owner Dashboard</h1>
        <p className="text-muted-foreground mb-8">
          Manage your parking lots
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-6">
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

          <button type="button" className="text-primary text-sm text-right">
            Forgot password?
          </button>

          <Button
            type="submit"
            className="h-14 rounded-2xl bg-primary text-white mt-4"
          >
            Sign In
          </Button>
        </form>

        {/* Register */}
        <div className="text-center mb-8">
          <span className="text-muted-foreground">
            New parking lot owner?{' '}
          </span>
          <button className="text-primary">
            Register Now
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
  );
}
