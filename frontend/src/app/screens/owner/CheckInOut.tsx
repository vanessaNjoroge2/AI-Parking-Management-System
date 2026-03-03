import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, QrCode, CheckCircle, XCircle, MapPin, Calendar, Clock, Car } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { StatusBadge } from '../../components/StatusBadge';

export function CheckInOut() {
  const navigate = useNavigate();
  const [scanned, setScanned] = useState(false);

  const booking = {
    code: 'PKS-2026-4872',
    vehicle: 'ABC-1234',
    location: 'Downtown Plaza Parking',
    date: 'February 20, 2026',
    time: '09:00 AM - 05:00 PM',
    status: 'confirmed' as const,
    amount: 64,
    customer: 'Jane Smith',
  };

  return (
    <div className="min-h-screen flex flex-col max-w-[390px] mx-auto bg-background">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-6 shadow-xl">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/owner/todays-bookings')}
            className="p-2.5 bg-slate-800 rounded-md border border-slate-700 hover:bg-slate-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </button>
          <div className="text-left">
            <h2 className="text-xl font-semibold text-white tracking-tight">Gate Protocol</h2>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Entry Validation</p>
          </div>
        </div>
      </div>

      <div className="flex-1 px-6 py-6 flex flex-col">
        {/* QR Scanner */}
        {!scanned ? (
          <div className="mb-6">
            <button
              onClick={() => setScanned(true)}
              className="w-full aspect-square bg-slate-900 border border-slate-800 rounded-lg flex flex-col items-center justify-center gap-6 hover:border-blue-500/50 group transition-all relative overflow-hidden active:scale-[0.98]"
            >
              <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="p-8 bg-blue-600/10 rounded-full border border-blue-500/20 group-hover:scale-110 transition-transform">
                <QrCode className="w-16 h-16 text-blue-500" />
              </div>
              <div className="text-center relative z-10">
                <p className="text-lg font-semibold text-white mb-1">Launch Scanner</p>
                <p className="text-xs text-slate-500 font-medium">Position code within the frame</p>
              </div>
            </button>
          </div>
        ) : (
          <div className="mb-6">
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-6 text-center animate-in zoom-in-95 duration-300">
              <CheckCircle className="w-12 h-12 text-blue-600 mx-auto mb-3" />
              <p className="text-lg font-semibold text-slate-900 mb-1">Identity Verified</p>
              <p className="text-xs text-slate-500 font-medium font-mono uppercase tracking-tighter">Code Alpha-Valid • Gate Open</p>
            </div>
          </div>
        )}

        {/* Booking Details */}
        {scanned && (
          <div className="bg-white rounded-lg p-6 mb-6 shadow-sm border border-slate-200 text-left animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-900">Session Digest</h3>
              <StatusBadge status={booking.status} />
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-slate-50 border border-slate-100 rounded-md">
                  <QrCode className="w-4 h-4 text-slate-400" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Reference</p>
                  <p className="text-base font-mono font-bold text-slate-900">{booking.code}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-slate-50 border border-slate-100 rounded-md">
                    <Car className="w-4 h-4 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Asset</p>
                    <p className="text-sm font-semibold text-slate-900">{booking.vehicle}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-slate-50 border border-slate-100 rounded-md">
                    <Clock className="w-4 h-4 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Window</p>
                    <p className="text-xs font-semibold text-slate-900 leading-tight">09:00 - 17:00</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Transaction</span>
                  <span className="text-2xl font-bold text-blue-600">KES {booking.amount}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Action Buttons */}
        {scanned && (
          <div className="space-y-4 mt-auto">
            <Button
              onClick={() => {
                navigate('/owner/todays-bookings');
              }}
              className="w-full h-14 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 font-semibold shadow-lg shadow-blue-600/10"
            >
              <CheckCircle className="w-5 h-5" />
              Authorize Access
            </Button>

            <Button
              variant="outline"
              onClick={() => setScanned(false)}
              className="w-full h-12 rounded-md border border-slate-200 text-slate-500 flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors font-medium"
            >
              <XCircle className="w-4 h-4 text-slate-300" />
              Reset Protocol
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
