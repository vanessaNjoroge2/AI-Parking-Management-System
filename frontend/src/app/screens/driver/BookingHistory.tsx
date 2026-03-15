import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, MapPin, Calendar, Clock, ChevronRight } from 'lucide-react';
import { StatusBadge } from '../../components/StatusBadge';
import { Button } from '../../components/ui/button';
import { fetchMyBookings, BookingRecord } from '../../services/bookings';
import { format } from 'date-fns';

export function BookingHistory() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');
  const [parkingFilter, setParkingFilter] = useState('');
  const [timeFilter, setTimeFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
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
    <div className="min-h-screen flex flex-col max-w-2xl mx-auto bg-slate-50">
      {/* Header */}
      <div className="bg-white px-8 py-8 border-b border-slate-200">
        <div className="flex items-center gap-5 mb-8">
          <button
            onClick={() => navigate('/search')}
            className="p-2.5 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div className="text-left">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Bookings</h2>
            <p className="text-sm font-medium text-slate-500">History of your parking reservations</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            {(['all', 'upcoming', 'past'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`px-5 py-2 rounded-lg text-sm font-bold uppercase tracking-wider transition-all border ${filter === t
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                  }`}
              >
                {t}
              </button>
            ))}
          </div>
          
          <div className="flex flex-wrap gap-3">
            <select 
              value={parkingFilter} 
              onChange={(e) => setParkingFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">All Parking</option>
              <option value="downtown">Downtown Plaza</option>
              <option value="airport">Airport Terminal</option>
              <option value="westlands">Westlands Square</option>
            </select>
            
            <select 
              value={timeFilter} 
              onChange={(e) => setTimeFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">Any Time</option>
              <option value="morning">Morning</option>
              <option value="afternoon">Afternoon</option>
              <option value="evening">Evening</option>
            </select>
            
            <select 
              value={paymentFilter} 
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>
      </div>

      {/* Bookings List */}
      <div className="flex-1 px-8 py-8 space-y-6">
        {isLoading && (
          <div className="text-center py-20 text-slate-400 italic">Synchronizing reservation history...</div>
        )}

        {!isLoading && error && (
          <div className="text-center py-10 px-6 bg-red-50 border border-red-100 rounded-xl text-red-600">{error}</div>
        )}

        {!isLoading && !error && filteredBookings.length === 0 && (
          <div className="text-center py-20 bg-white border border-dashed border-slate-200 rounded-2xl">
            <p className="text-slate-400 font-medium">No bookings found in this category.</p>
            <Button variant="link" onClick={() => navigate('/search')} className="text-blue-600 mt-2">Find a parking spot</Button>
          </div>
        )}

        {!isLoading && !error && filteredBookings.map((booking) => {
          const lotName = booking.parkingLot?.name ?? 'Parking Spot';
          const address = booking.parkingLot?.addressText ?? 'Nairobi, Kenya';
          const amount = booking.payment?.amount ?? 0;
          const currency = booking.payment?.currency ?? 'KES';

          return (
            <button
              key={booking.id}
              onClick={() => navigate('/booking-details', { state: { booking } })}
              className="w-full bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all border border-slate-200 text-left group"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors truncate pr-4">{lotName}</h3>
                  <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500 uppercase tracking-wide">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{address}</span>
                  </div>
                </div>
                <StatusBadge status={getStatusBadge(booking.status)} />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6 pt-4 border-t border-slate-50">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</p>
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <Calendar className="w-4 h-4 text-blue-600/50" />
                    <span>{formatDate(booking.startTime)}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Duration</p>
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <Clock className="w-4 h-4 text-blue-600/50" />
                    <span>{formatTimeRange(booking.startTime, booking.endTime)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-5 border-t border-slate-100 mt-2">
                <div className="text-left font-mono text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                  RES No: {formatCode(booking.id)}
                </div>
                <div className="text-xl font-bold text-slate-900">
                  <span className="text-xs text-slate-400 font-normal mr-1">{currency}</span>
                  {amount}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
