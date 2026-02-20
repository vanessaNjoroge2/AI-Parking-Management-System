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
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/owner/dashboard')}
              className="p-2 hover:bg-secondary rounded-xl transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-foreground" />
            </button>
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Today's Bookings</h2>
              <p className="text-sm text-muted-foreground">February 19, 2026</p>
            </div>
          </div>

          <div className="flex gap-4 w-full md:w-auto">
            <div className="flex-1 md:w-48 bg-primary/5 rounded-2xl p-4 flex items-center gap-3 border border-primary/10">
              <div className="p-2 bg-primary/20 rounded-xl">
                <Car className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-primary leading-none">{bookings.length}</p>
                <p className="text-xs text-muted-foreground">Total Cars</p>
              </div>
            </div>
            <div className="flex-1 md:w-48 bg-accent/5 rounded-2xl p-4 flex items-center gap-3 border border-accent/10">
              <div className="p-2 bg-accent/20 rounded-xl">
                <Clock className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-accent leading-none">
                  ${bookings.reduce((sum, b) => sum + b.amount, 0)}
                </p>
                <p className="text-xs text-muted-foreground">Exp. Revenue</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bookings List */}
        <div className="grid grid-cols-1 gap-4">
          {bookings.map((booking) => (
            <button
              key={booking.id}
              onClick={() => navigate('/owner/check-in-out')}
              className="group bg-white rounded-2xl p-4 md:p-6 shadow-sm hover:shadow-md transition-all border border-border/50 flex flex-col md:flex-row items-start md:items-center gap-6"
            >
              {/* Icon/Avatar Status */}
              <div className={`p-4 rounded-2xl hidden md:flex items-center justify-center ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                }`}>
                <Car className="w-6 h-6" />
              </div>

              {/* Main Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
                  <span className="text-lg font-bold font-mono tracking-wide">{booking.code}</span>
                  <StatusBadge status={booking.status} />
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{booking.location}</span>
                </div>
              </div>

              {/* Details Columns */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-12 w-full md:w-auto">
                <div>
                  <span className="text-xs text-muted-foreground block mb-1">Vehicle</span>
                  <div className="flex items-center gap-2 font-medium">
                    <Car className="w-4 h-4 text-muted-foreground md:hidden" />
                    {booking.vehicle}
                  </div>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block mb-1">Time</span>
                  <div className="flex items-center gap-2 font-medium">
                    <Clock className="w-4 h-4 text-muted-foreground md:hidden" />
                    <span className="whitespace-nowrap">{booking.time}</span>
                  </div>
                </div>
                <div className="col-span-2 md:col-span-1 border-t md:border-t-0 pt-4 md:pt-0 mt-2 md:mt-0 flex md:flex-col items-center md:items-end justify-between">
                  <span className="text-xs text-muted-foreground md:mb-1">Amount</span>
                  <span className="text-xl font-bold text-accent">${booking.amount}</span>
                </div>
              </div>

              <div className="hidden md:block text-muted-foreground group-hover:text-primary transition-colors">
                <ChevronRight className="w-5 h-5" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
