import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, MapPin, Calendar, Clock, ChevronRight } from 'lucide-react';
import { StatusBadge } from '../../components/StatusBadge';

export function BookingHistory() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');

  const bookings = [
    {
      id: 1,
      location: 'Downtown Plaza Parking',
      address: '123 Main St',
      date: 'Feb 20, 2026',
      time: '09:00 AM - 05:00 PM',
      status: 'confirmed' as const,
      price: 64,
      code: 'PKS-2026-4872',
    },
    {
      id: 2,
      location: 'City Mall Parking',
      address: '456 Oak Ave',
      date: 'Feb 18, 2026',
      time: '02:00 PM - 06:00 PM',
      status: 'confirmed' as const,
      price: 32,
      code: 'PKS-2026-4810',
    },
    {
      id: 3,
      location: 'Airport Terminal 2',
      address: 'Airport Rd',
      date: 'Feb 15, 2026',
      time: '08:00 AM - 10:00 AM',
      status: 'cancelled' as const,
      price: 20,
      code: 'PKS-2026-4756',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col max-w-[390px] mx-auto bg-background">
      {/* Header */}
      <div className="bg-white px-6 py-6 shadow-sm">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/search')}
            className="p-2 hover:bg-secondary rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-primary" />
          </button>
          <h2 className="text-2xl">Booking History</h2>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl transition-all ${
              filter === 'all'
                ? 'bg-primary text-white'
                : 'bg-secondary text-foreground'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-4 py-2 rounded-xl transition-all ${
              filter === 'upcoming'
                ? 'bg-primary text-white'
                : 'bg-secondary text-foreground'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setFilter('past')}
            className={`px-4 py-2 rounded-xl transition-all ${
              filter === 'past'
                ? 'bg-primary text-white'
                : 'bg-secondary text-foreground'
            }`}
          >
            Past
          </button>
        </div>
      </div>

      {/* Bookings List */}
      <div className="flex-1 px-6 py-6 space-y-4">
        {bookings.map((booking) => (
          <button
            key={booking.id}
            onClick={() => navigate('/booking-confirmation')}
            className="w-full bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow text-left"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="mb-1">{booking.location}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  <MapPin className="w-4 h-4" />
                  <span>{booking.address}</span>
                </div>
                <StatusBadge status={booking.status} />
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>

            <div className="flex items-center gap-4 mb-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>{booking.date}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{booking.time}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border">
              <span className="text-sm text-muted-foreground">
                Code: {booking.code}
              </span>
              <span className="text-lg text-primary">${booking.price}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
