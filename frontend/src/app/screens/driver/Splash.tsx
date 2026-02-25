import React, { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ParkingCircle } from 'lucide-react';
import { MobileFrame } from '../../components/MobileFrame';

export function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/login');
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <MobileFrame>
      <div className="min-h-screen bg-primary flex flex-col items-center justify-center px-6">
        <div className="flex flex-col items-center gap-6 animate-fade-in">
          <div className="bg-white/10 p-6 rounded-3xl backdrop-blur-sm">
            <ParkingCircle className="w-20 h-20 text-white" strokeWidth={1.5} />
          </div>
          <div className="text-center">
            <h1 className="text-4xl text-white mb-2">ParkSmart</h1>
            <p className="text-white/80">Find parking in seconds</p>
          </div>
        </div>
      </div>
    </MobileFrame>
  );
}