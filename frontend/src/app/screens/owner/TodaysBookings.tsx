import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Clock, Car, MapPin, ChevronRight } from 'lucide-react';
import { StatusBadge } from '../../components/StatusBadge';

export function TodaysBookings() {
  const navigate = useNavigate();
  const [parkingFilter, setParkingFilter] = useState('');
  const [timeFilter, setTimeFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

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

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <select 
            value={parkingFilter} 
            onChange={(e) => setParkingFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-md text-sm font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm"
          >
            <option value="">All Parking</option>
            <option value="downtown">Downtown Plaza</option>
            <option value="airport">Airport Terminal</option>
            <option value="city">City Mall</option>
          </select>
          
          <select 
            value={timeFilter} 
            onChange={(e) => setTimeFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-md text-sm font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm"
          >
            <option value="">Any Time</option>
            <option value="morning">Morning</option>
            <option value="afternoon">Afternoon</option>
            <option value="evening">Evening</option>
          </select>
          
          <select 
            value={paymentFilter} 
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-md text-sm font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm"
          >
            <option value="">All Payments</option>
            <option value="mpesa">M-Pesa</option>
            <option value="card">Card</option>
            <option value="cash">Cash</option>
          </select>
          
          <input 
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-md text-sm font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm"
          />
        </div>

        <div className="grid grid-cols-1 gap-4">
          {bookings.map((booking) => (
            <button
              key={booking.id}
              onClick={() => navigate('/owner/check-in-out')}
              className="group bg-white rounded-lg p-4 md:p-6 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all border border-slate-200 flex flex-col md:flex-row items-start md:items-center gap-6 text-left"
            >
              {/* Icon Status */}
              <div className={`p-3 rounded-md border hidden md:flex items-center justify-center transition-colors ${booking.status === 'confirmed' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-amber-50 border-amber-100 text-amber-600'
                }`}>
                <Car className="w-5 h-5" />
              </div>

              {/* Main Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3 mb-1">
                  <span className="text-base font-bold font-mono tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">{booking.code}</span>
                  <StatusBadge status={booking.status} />
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                  <MapPin className="w-3 h-3" />
                  <span>{booking.location}</span>
                </div>
              </div>

              {/* Details Columns */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8 w-full md:w-auto">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Vehicle</span>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900">
                    <Car className="w-3.5 h-3.5 text-slate-400 md:hidden" />
                    {booking.vehicle}
                  </div>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Time Profile</span>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900">
                    <Clock className="w-3.5 h-3.5 text-slate-400 md:hidden" />
                    <span className="whitespace-nowrap">{booking.time}</span>
                  </div>
                </div>
                <div className="col-span-2 md:col-span-1 border-t md:border-t-0 pt-3 md:pt-0 mt-1 md:mt-0 flex md:flex-col items-center md:items-end justify-between">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest md:mb-0.5">Settlement</span>
                  <span className="text-lg font-bold text-blue-600">KES {booking.amount}</span>
                </div>
              </div>

              <div className="hidden md:block text-slate-300 group-hover:text-blue-600 transition-colors bg-slate-50 rounded-md p-1.5 border border-slate-100 group-hover:bg-blue-50 group-hover:border-blue-100">
                <ChevronRight className="w-4 h-4" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
