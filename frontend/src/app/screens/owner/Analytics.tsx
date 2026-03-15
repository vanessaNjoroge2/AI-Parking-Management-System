import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, TrendingUp, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { fetchOwnerBookings, type OwnerBookingRecord } from '../../services/ownerBookings';
import { getOwnerParkingLots, type ParkingLot } from '../../services/parkingLots';
import { eachDayOfInterval, endOfDay, format, startOfDay, subDays } from 'date-fns';

export function Analytics() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<OwnerBookingRecord[]>([]);
  const [lots, setLots] = useState<ParkingLot[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError('');
      try {
        const days = eachDayOfInterval({
          start: startOfDay(subDays(new Date(), 6)),
          end: startOfDay(new Date()),
        });

        const [fetchedLots, bookingsByDay] = await Promise.all([
          getOwnerParkingLots(),
          Promise.all(days.map((day) => fetchOwnerBookings(format(day, 'yyyy-MM-dd')))),
        ]);

  setBookings(bookingsByDay.flat());
        setLots(fetchedLots);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load analytics');
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  const last7Days = useMemo(
    () => eachDayOfInterval({ start: startOfDay(subDays(new Date(), 6)), end: startOfDay(new Date()) }),
    [],
  );

  const revenueData = useMemo(
    () =>
      last7Days.map((day) => {
        const key = format(day, 'yyyy-MM-dd');
        const dayBookings = bookings.filter(
          (booking) => format(new Date(booking.startTime), 'yyyy-MM-dd') === key,
        );
        return {
          day: format(day, 'EEE'),
          revenue: dayBookings.reduce((sum, booking) => sum + (booking.payment?.amount ?? 0), 0),
        };
      }),
    [bookings, last7Days],
  );

  const bookingsData = useMemo(
    () =>
      last7Days.map((day) => {
        const key = format(day, 'yyyy-MM-dd');
        const dayBookings = bookings.filter(
          (booking) => format(new Date(booking.startTime), 'yyyy-MM-dd') === key,
        );
        return {
          day: format(day, 'EEE'),
          bookings: dayBookings.length,
        };
      }),
    [bookings, last7Days],
  );

  const totalRevenue = useMemo(
    () => bookings.reduce((sum, booking) => sum + (booking.payment?.amount ?? 0), 0),
    [bookings],
  );

  const occupancyByLocation = useMemo(
    () =>
      lots.map((lot) => {
        const occupied = lot.occupiedSpots ?? 0;
        const rate = lot.capacityTotal > 0 ? Math.round((occupied / lot.capacityTotal) * 100) : 0;
        return {
          name: lot.name,
          rate,
          color:
            rate >= 80 ? 'bg-warning' : rate >= 50 ? 'bg-primary' : 'bg-accent',
        };
      }),
    [lots],
  );

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 flex justify-center">
      <div className="max-w-7xl w-full">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/owner/dashboard')}
            className="p-2 hover:bg-secondary rounded-xl transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Analytics Overview</h2>
            <p className="text-sm text-muted-foreground">Performance for the last 7 days</p>
          </div>
        </div>

        <div className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-red-600 text-sm">{error}</div>
          )}

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-accent to-accent/90 rounded-3xl p-6 md:p-8 text-white shadow-lg flex items-center justify-between">
              <div>
                <p className="text-white/80 font-medium mb-1">Total Revenue</p>
                <p className="text-4xl font-bold">KES {totalRevenue.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-white/10 rounded-2xl">
                <DollarSign className="w-10 h-10 text-white" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-primary to-primary/90 rounded-3xl p-6 md:p-8 text-white shadow-lg flex items-center justify-between">
              <div>
                <p className="text-white/80 font-medium mb-1">Total Bookings</p>
                <p className="text-4xl font-bold">{bookings.length}</p>
              </div>
              <div className="p-4 bg-white/10 rounded-2xl">
                <TrendingUp className="w-10 h-10 text-white" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Chart */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-border/50">
              <h3 className="text-lg font-semibold mb-6">Daily Revenue</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                    <XAxis
                      dataKey="day"
                      stroke="#64748B"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      dy={10}
                    />
                    <YAxis
                      stroke="#64748B"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `KES ${value}`}
                    />
                    <Bar
                      dataKey="revenue"
                      fill="#10B981"
                      radius={[8, 8, 8, 8]}
                      barSize={32}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bookings Chart */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-border/50">
              <h3 className="text-lg font-semibold mb-6">Daily Bookings</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={bookingsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                    <XAxis
                      dataKey="day"
                      stroke="#64748B"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      dy={10}
                    />
                    <YAxis
                      stroke="#64748B"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Bar
                      dataKey="bookings"
                      fill="#1E3A8A"
                      radius={[8, 8, 8, 8]}
                      barSize={32}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

<<<<<<< HEAD
=======
          {/* Occupancy Rate */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-border/50">
            <h3 className="text-lg font-semibold mb-6">Occupancy Rate by Location</h3>
            <div className="space-y-6">
              {isLoading && <p className="text-sm text-slate-400">Loading occupancy...</p>}
              {!isLoading && occupancyByLocation.map((lot, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-foreground">{lot.name}</span>
                    <span className="font-semibold">{lot.rate}%</span>
                  </div>
                  <div className="h-3 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full ${lot.color} rounded-full transition-all duration-1000 ease-out`}
                      style={{ width: `${lot.rate}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
>>>>>>> a17c167a11f2c057d3911561214a85a4210da1c1
        </div>
      </div>
    </div>
  );
}
