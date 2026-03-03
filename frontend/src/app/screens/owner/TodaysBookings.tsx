import React from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Clock, Car, MapPin, ChevronRight } from 'lucide-react';
import { StatusBadge } from '../../components/StatusBadge';

export function TodaysBookings() {
  const navigate = useNavigate();

  const bookings = [
    {
      id: 1,
      code: 'PKS-2026-4872',
      vehicle: 'ABC-1234',
      location: 'Downtown Plaza',
      time: '09:00 AM - 05:00 PM',
      status: 'confirmed' as const,
      amount: 64,
    },
    {
      id: 2,
      code: 'PKS-2026-4880',
      vehicle: 'XYZ-5678',
      location: 'Downtown Plaza',
      time: '10:00 AM - 02:00 PM',
      status: 'confirmed' as const,
      amount: 32,
    },
    {
      id: 3,
      code: 'PKS-2026-4885',
      vehicle: 'DEF-9012',
      location: 'City Mall',
      time: '08:00 AM - 12:00 PM',
      status: 'pending' as const,
      amount: 24,
    },
    {
      id: 4,
      code: 'PKS-2026-4890',
      vehicle: 'GHI-3456',
      location: 'Airport Terminal',
      time: '06:00 AM - 10:00 PM',
      status: 'confirmed' as const,
      amount: 128,
    },
  ];

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 flex justify-center">
      <div className="max-w-6xl w-full">
        {/* Header & Stats */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8 border-b border-slate-200 pb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/owner/dashboard')}
              className="p-2.5 hover:bg-slate-100 rounded-md transition-colors border border-slate-200"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div className="text-left">
              <h2 className="text-3xl font-semibold tracking-tight text-slate-900">Operations</h2>
              <p className="text-sm font-medium text-slate-500">Scheduled Bookings • {new Date().toLocaleDateString('en-KE', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
            </div>
          </div>

          <div className="flex gap-4 w-full md:w-auto">
            <div className="flex-1 md:w-48 bg-white rounded-lg p-4 flex items-center gap-4 border border-slate-200 shadow-sm">
              <div className="p-3 bg-blue-50 rounded-md border border-blue-100">
                <Car className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-left">
                <p className="text-2xl font-bold text-slate-900 leading-none">{bookings.length}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Arrivals</p>
              </div>
            </div>
            <div className="flex-1 md:w-48 bg-white rounded-lg p-4 flex items-center gap-4 border border-slate-200 shadow-sm">
              <div className="p-3 bg-emerald-50 rounded-md border border-emerald-100">
                <Clock className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="text-left">
                <p className="text-2xl font-bold text-slate-900 leading-none">
                  KES {bookings.reduce((sum, b) => sum + b.amount, 0)}
                </p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Projected</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {bookings.map((booking) => (
            <button
              key={booking.id}
              onClick={() => navigate('/owner/check-in-out')}
              className="group bg-white rounded-lg p-4 md:p-6 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all border border-slate-200 flex flex-col md:flex-row items-start md:items-center gap-6 text-left"
            >
              {/* Icon Status */}
              <div className={`p-4 rounded-md border hidden md:flex items-center justify-center transition-colors ${booking.status === 'confirmed' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-amber-50 border-amber-100 text-amber-600'
                }`}>
                <Car className="w-6 h-6" />
              </div>

              {/* Main Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
                  <span className="text-lg font-bold font-mono tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">{booking.code}</span>
                  <StatusBadge status={booking.status} />
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{booking.location}</span>
                </div>
              </div>

              {/* Details Columns */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-12 w-full md:w-auto">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Vehicle</span>
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <Car className="w-4 h-4 text-slate-400 md:hidden" />
                    {booking.vehicle}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Time Profile</span>
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <Clock className="w-4 h-4 text-slate-400 md:hidden" />
                    <span className="whitespace-nowrap">{booking.time}</span>
                  </div>
                </div>
                <div className="col-span-2 md:col-span-1 border-t md:border-t-0 pt-4 md:pt-0 mt-2 md:mt-0 flex md:flex-col items-center md:items-end justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest md:mb-1">Settlement</span>
                  <span className="text-xl font-bold text-blue-600">KES {booking.amount}</span>
                </div>
              </div>

              <div className="hidden md:block text-slate-300 group-hover:text-blue-600 transition-colors bg-slate-50 rounded-md p-2 border border-slate-100 group-hover:bg-blue-50 group-hover:border-blue-100">
                <ChevronRight className="w-5 h-5" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
