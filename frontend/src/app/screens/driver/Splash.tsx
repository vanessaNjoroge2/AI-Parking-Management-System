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
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center px-6">
        <div className="flex flex-col items-center gap-6 animate-fade-in">
          <div className="bg-blue-600/10 p-5 rounded-lg border border-blue-500/20">
            <ParkingCircle className="w-16 h-16 text-blue-500" strokeWidth={1.5} />
          </div>
          <div className="text-center">
            <h1 className="text-4xl font-semibold text-white mb-2 tracking-tight">ParkSmart</h1>
            <p className="text-slate-400 font-medium">Urban Mobility Infrastructure</p>
          </div>
        </div>
      </div>
    </MobileFrame>
  );
}