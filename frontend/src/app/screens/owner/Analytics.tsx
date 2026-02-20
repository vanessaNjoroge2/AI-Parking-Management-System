import React from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, TrendingUp, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

export function Analytics() {
  const navigate = useNavigate();

  const revenueData = [
    { day: 'Mon', revenue: 1200 },
    { day: 'Tue', revenue: 1800 },
    { day: 'Wed', revenue: 1500 },
    { day: 'Thu', revenue: 2200 },
    { day: 'Fri', revenue: 2800 },
    { day: 'Sat', revenue: 3200 },
    { day: 'Sun', revenue: 2400 },
  ];

  const bookingsData = [
    { day: 'Mon', bookings: 15 },
    { day: 'Tue', bookings: 22 },
    { day: 'Wed', bookings: 18 },
    { day: 'Thu', bookings: 28 },
    { day: 'Fri', bookings: 35 },
    { day: 'Sat', bookings: 40 },
    { day: 'Sun', bookings: 30 },
  ];

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
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-accent to-accent/90 rounded-3xl p-6 md:p-8 text-white shadow-lg flex items-center justify-between">
              <div>
                <p className="text-white/80 font-medium mb-1">Total Revenue</p>
                <p className="text-4xl font-bold">$15,100</p>
              </div>
              <div className="p-4 bg-white/10 rounded-2xl">
                <DollarSign className="w-10 h-10 text-white" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-primary to-primary/90 rounded-3xl p-6 md:p-8 text-white shadow-lg flex items-center justify-between">
              <div>
                <p className="text-white/80 font-medium mb-1">Total Bookings</p>
                <p className="text-4xl font-bold">188</p>
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
                      tickFormatter={(value) => `$${value}`}
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

          {/* Occupancy Rate */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-border/50">
            <h3 className="text-lg font-semibold mb-6">Occupancy Rate by Location</h3>
            <div className="space-y-6">
              {[
                { name: 'Downtown Plaza', rate: 78, color: 'bg-accent' },
                { name: 'City Mall', rate: 64, color: 'bg-primary' },
                { name: 'Airport Terminal', rate: 100, color: 'bg-warning' },
              ].map((lot, index) => (
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
        </div>
      </div>
    </div>
  );
}
