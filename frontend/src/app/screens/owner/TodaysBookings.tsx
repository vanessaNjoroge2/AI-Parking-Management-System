import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { ArrowLeft, Clock, Car, MapPin, ChevronRight, Search } from 'lucide-react';
import { StatusBadge } from '../../components/StatusBadge';
import { fetchOwnerBookingsRange, type OwnerBookingRecord } from '../../services/ownerBookings';
import { format, startOfDay } from 'date-fns';
import { Calendar } from '../../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover';
import type { DateRange } from 'react-day-picker';
import { Button } from '../../components/ui/button';

export function TodaysBookings() {
  const navigate = useNavigate();
  const location = useLocation();
  const preservedState = (location.state as {
    filters?: {
      dateFrom?: string;
      dateTo?: string;
      statusFilter?: 'all' | 'confirmed' | 'pending' | 'cancelled';
      lotFilter?: string;
      searchQuery?: string;
    };
  } | undefined)?.filters;
  const [bookings, setBookings] = useState<OwnerBookingRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: preservedState?.dateFrom ? startOfDay(new Date(preservedState.dateFrom)) : startOfDay(new Date()),
    to: preservedState?.dateTo ? startOfDay(new Date(preservedState.dateTo)) : startOfDay(new Date()),
  });
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'pending' | 'cancelled'>(preservedState?.statusFilter ?? 'all');
  const [lotFilter, setLotFilter] = useState<string>(preservedState?.lotFilter ?? 'all');
  const [searchQuery, setSearchQuery] = useState(preservedState?.searchQuery ?? '');

  useEffect(() => {
    const load = async () => {
      if (!dateRange?.from || !dateRange?.to) return;
      setIsLoading(true);
      setError('');
      try {
        const data = await fetchOwnerBookingsRange(
          format(dateRange.from, 'yyyy-MM-dd'),
          format(dateRange.to, 'yyyy-MM-dd'),
        );
        setBookings(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load today\'s bookings');
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [dateRange?.from, dateRange?.to]);

  const totalProjected = useMemo(
    () => bookings.reduce((sum, booking) => sum + (booking.payment?.amount ?? 0), 0),
    [bookings],
  );

  const getBadgeStatus = (status: OwnerBookingRecord['status']) => {
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

  const formatCode = (id: string) => `PKS-${id.slice(0, 8).toUpperCase()}`;

  const availableLots = useMemo(() => {
    const lots = new Map<string, string>();
    bookings.forEach((booking) => {
      if (booking.parkingLot?.id && booking.parkingLot.name) {
        lots.set(booking.parkingLot.id, booking.parkingLot.name);
      }
    });
    return Array.from(lots.entries()).map(([id, name]) => ({ id, name }));
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    return bookings.filter((booking) => {
      const badgeStatus = getBadgeStatus(booking.status);
      if (statusFilter !== 'all' && badgeStatus !== statusFilter) return false;
      if (lotFilter !== 'all' && booking.parkingLot?.id !== lotFilter) return false;
      if (
        normalizedQuery &&
        ![
          booking.vehiclePlate ?? '',
          booking.user?.fullName ?? '',
          booking.user?.phone ?? '',
          booking.parkingLot?.name ?? '',
        ].some((value) => value.toLowerCase().includes(normalizedQuery))
      ) {
        return false;
      }
      return true;
    });
  }, [bookings, lotFilter, searchQuery, statusFilter]);

  const filteredProjected = useMemo(
    () => filteredBookings.reduce((sum, booking) => sum + (booking.payment?.amount ?? 0), 0),
    [filteredBookings],
  );

  const currentFilterState = useMemo(
    () => ({
      dateFrom: dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined,
      dateTo: dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined,
      statusFilter,
      lotFilter,
      searchQuery,
    }),
    [dateRange?.from, dateRange?.to, lotFilter, searchQuery, statusFilter],
  );

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 flex justify-center">
      <div className="max-w-6xl w-full">
        {/* Header & Stats */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8 border-b border-slate-200 pb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/owner/dashboard', {
                state: { ownerFilters: currentFilterState },
              })}
              className="p-2.5 hover:bg-slate-100 rounded-md transition-colors border border-slate-200"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div className="text-left">
              <h2 className="text-3xl font-semibold tracking-tight text-slate-900">Bookings</h2>
              <p className="text-sm font-medium text-slate-500">
                Booking activity • {dateRange?.from
                  ? dateRange.to
                    ? `${format(dateRange.from, 'MMM dd, yyyy')} - ${format(dateRange.to, 'MMM dd, yyyy')}`
                    : format(dateRange.from, 'MMM dd, yyyy')
                  : 'Select date range'}
              </p>
            </div>
          </div>

          <div className="flex gap-4 w-full md:w-auto items-stretch flex-wrap">
            <div className="relative min-w-[240px] flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by plate or customer"
                className="h-12 w-full rounded-md border border-slate-200 bg-white pl-10 pr-4 text-sm font-medium text-slate-700 outline-none focus:border-blue-500"
              />
            </div>

            <Popover open={isDateOpen} onOpenChange={setIsDateOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-12 min-w-[240px] justify-start bg-white border-slate-200 text-slate-700">
                  {dateRange?.from
                    ? dateRange.to
                      ? `${format(dateRange.from, 'MMM dd')} - ${format(dateRange.to, 'MMM dd')}`
                      : format(dateRange.from, 'MMM dd')
                    : 'Select date range'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="h-12 rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700"
            >
              <option value="all">All statuses</option>
              <option value="confirmed">Confirmed / Active</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled / Closed</option>
            </select>

            <select
              value={lotFilter}
              onChange={(e) => setLotFilter(e.target.value)}
              className="h-12 rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700"
            >
              <option value="all">All facilities</option>
              {availableLots.map((lot) => (
                <option key={lot.id} value={lot.id}>{lot.name}</option>
              ))}
            </select>

            <div className="flex-1 md:w-48 bg-white rounded-lg p-4 flex items-center gap-4 border border-slate-200 shadow-sm">
              <div className="p-3 bg-blue-50 rounded-md border border-blue-100">
                <Car className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-left">
                <p className="text-2xl font-bold text-slate-900 leading-none">{filteredBookings.length}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Arrivals</p>
              </div>
            </div>
            <div className="flex-1 md:w-48 bg-white rounded-lg p-4 flex items-center gap-4 border border-slate-200 shadow-sm">
              <div className="p-3 bg-emerald-50 rounded-md border border-emerald-100">
                <Clock className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="text-left">
                <p className="text-2xl font-bold text-slate-900 leading-none">
                  KES {filteredProjected}
                </p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Expected revenue</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {isLoading && (
            <div className="py-12 text-center text-slate-400 italic">Loading bookings...</div>
          )}

          {!isLoading && error && (
            <div className="py-6 px-4 bg-red-50 border border-red-100 rounded-md text-red-600 text-center">{error}</div>
          )}

          {!isLoading && !error && filteredBookings.length === 0 && (
            <div className="py-12 text-center text-slate-400 border border-dashed border-slate-200 rounded-lg bg-white">
              No bookings found for the selected filters.
            </div>
          )}

          {filteredBookings.map((booking) => (
            <button
              key={booking.id}
              onClick={() => navigate('/owner/check-in-out', {
                state: {
                  booking,
                  lookupRange: dateRange?.from && dateRange?.to
                    ? {
                        from: format(dateRange.from, 'yyyy-MM-dd'),
                        to: format(dateRange.to, 'yyyy-MM-dd'),
                      }
                    : undefined,
                  persistedFilters: currentFilterState,
                },
              })}
              className="group bg-white rounded-lg p-4 md:p-6 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all border border-slate-200 flex flex-col md:flex-row items-start md:items-center gap-6 text-left"
            >
              {/* Icon Status */}
              <div className={`p-3 rounded-md border hidden md:flex items-center justify-center transition-colors ${getBadgeStatus(booking.status) === 'confirmed' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-amber-50 border-amber-100 text-amber-600'
                }`}>
                <Car className="w-5 h-5" />
              </div>

              {/* Main Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3 mb-1">
                  <span className="text-base font-bold font-mono tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">{formatCode(booking.id)}</span>
                  <StatusBadge status={getBadgeStatus(booking.status)} />
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                  <MapPin className="w-3 h-3" />
                  <span>{booking.parkingLot?.name ?? 'Facility unavailable'}</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  {booking.user?.fullName ?? 'Unknown customer'}
                </div>
              </div>

              {/* Details Columns */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8 w-full md:w-auto">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Vehicle</span>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900">
                    <Car className="w-3.5 h-3.5 text-slate-400 md:hidden" />
                    {booking.vehiclePlate ?? 'Not provided'}
                  </div>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Time Profile</span>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900">
                    <Clock className="w-3.5 h-3.5 text-slate-400 md:hidden" />
                    <span className="whitespace-nowrap">{format(new Date(booking.startTime), 'hh:mm a')} - {format(new Date(booking.endTime), 'hh:mm a')}</span>
                  </div>
                </div>
                <div className="col-span-2 md:col-span-1 border-t md:border-t-0 pt-3 md:pt-0 mt-1 md:mt-0 flex md:flex-col items-center md:items-end justify-between">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest md:mb-0.5">Settlement</span>
                  <span className="text-lg font-bold text-blue-600">KES {booking.payment?.amount ?? 0}</span>
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
