import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, MapPin, Calendar, Clock, ChevronRight } from 'lucide-react';
import { StatusBadge } from '../../components/StatusBadge';
import { fetchMyBookings, BookingRecord } from '../../services/bookings';
import { format } from 'date-fns';

export function BookingHistory() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError('');
      try {
        const data = await fetchMyBookings();
        setBookings(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load bookings');
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  const filteredBookings = useMemo(() => {
    if (filter === 'all') return bookings;

    const now = new Date();
    return bookings.filter((booking) => {
      const end = new Date(booking.endTime);
      return filter === 'upcoming' ? end >= now : end < now;
    });
  }, [bookings, filter]);

  const getStatusBadge = (status: BookingRecord['status']) => {
    switch (status) {
      case 'CONFIRMED':
      case 'CHECKED_IN':
      case 'COMPLETED':
        return 'confirmed' as const;
      case 'CANCELLED':
      case 'REFUNDED':
      case 'EXPIRED':
        return 'cancelled' as const;
      default:
        return 'pending' as const;
    }
  };

  const formatDate = (value: string) => format(new Date(value), 'MMM dd, yyyy');
  const formatTimeRange = (start: string, end: string) =>
    `${format(new Date(start), 'hh:mm a')} - ${format(new Date(end), 'hh:mm a')}`;
  const formatCode = (id: string) => `PKS-${id.slice(0, 8).toUpperCase()}`;

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
        {isLoading && (
          <div className="text-center text-muted-foreground">Loading bookings...</div>
        )}

        {!isLoading && error && (
          <div className="text-center text-destructive">{error}</div>
        )}

        {!isLoading && !error && filteredBookings.length === 0 && (
          <div className="text-center text-muted-foreground">No bookings yet.</div>
        )}

        {!isLoading && !error && filteredBookings.map((booking) => {
          const lotName = booking.parkingLot?.name ?? 'Parking Spot';
          const address = booking.parkingLot?.addressText ?? 'Address not available';
          const amount = booking.payment?.amount ?? 0;
          const currency = booking.payment?.currency ?? 'KES';

          return (
            <button
              key={booking.id}
              onClick={() => navigate('/booking-details', { state: { booking } })}
              className="w-full bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow text-left"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="mb-1">{lotName}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <MapPin className="w-4 h-4" />
                    <span>{address}</span>
                  </div>
                  <StatusBadge status={getStatusBadge(booking.status)} />
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>

              <div className="flex items-center gap-4 mb-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(booking.startTime)}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{formatTimeRange(booking.startTime, booking.endTime)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border">
                <span className="text-sm text-muted-foreground">
                  Code: {formatCode(booking.id)}
                </span>
                <span className="text-lg text-primary">
                  {currency} {amount}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
