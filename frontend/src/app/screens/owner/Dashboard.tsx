import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { PlusCircle, TrendingUp, Users, DollarSign, MapPin, MoreVertical, BarChart3, Calendar } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { StatusBadge } from '../../components/StatusBadge';
import { getOwnerParkingLots, ParkingLot } from '../../services/parkingLots';

export function Dashboard() {
  const navigate = useNavigate();
  const [lots, setLots] = useState<ParkingLot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError('');
      try {
        const data = await getOwnerParkingLots();
        setLots(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load parking lots');
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  const stats = useMemo(() => {
    const totalLots = lots.length;
    const activeLots = lots.filter((lot) => lot.isActive).length;
    const occupancyRate = totalLots === 0 ? 0 : Math.round((activeLots / totalLots) * 100);

    return [
      { label: 'Total Lots', value: String(totalLots), icon: DollarSign, color: 'text-accent', bg: 'bg-accent/10' },
      { label: 'Active Lots', value: String(activeLots), icon: Users, color: 'text-primary', bg: 'bg-primary/10' },
      { label: 'Active Rate', value: `${occupancyRate}%`, icon: TrendingUp, color: 'text-warning', bg: 'bg-warning/10' },
    ];
  }, [lots]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header / Nav */}
      <div className="bg-gradient-to-r from-primary to-accent text-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 flex items-center justify-between">
          <div>
            <p className="text-white/80 text-sm mb-1">Welcome back,</p>
            <h2 className="text-2xl font-bold">John Doe</h2>
          </div>
          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={() => navigate('/owner/analytics')}
              className="text-white hover:bg-white/10"
            >
              <BarChart3 className="w-5 h-5 mr-2" />
              Analytics
            </Button>
            <button className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-3xl p-6 shadow-sm border border-border/50 flex items-center gap-4 hover:shadow-md transition-all">
              <div className={`p-4 rounded-2xl ${stat.bg}`}>
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions & Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content: Parking Lots */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Your Parking Lots</h3>
              <Button
                onClick={() => navigate('/owner/add-lot')}
                className="rounded-2xl bg-primary text-white flex items-center gap-2 hover:bg-primary/90"
              >
                <PlusCircle className="w-5 h-5" />
                Add New Lot
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isLoading && (
                <div className="col-span-full text-center text-muted-foreground">Loading parking lots...</div>
              )}

              {!isLoading && error && (
                <div className="col-span-full text-center text-destructive">{error}</div>
              )}

              {!isLoading && !error && lots.length === 0 && (
                <div className="col-span-full text-center text-muted-foreground">No parking lots yet.</div>
              )}

              {!isLoading && !error && lots.map((lot) => (
                <button
                  key={lot.id}
                  onClick={() => navigate('/owner/edit-lot', { state: { lot } })}
                  className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all border border-border/50 text-left group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-secondary rounded-2xl group-hover:bg-primary/10 transition-colors">
                      <MapPin className="w-6 h-6 text-primary" />
                    </div>
                    <StatusBadge status={lot.isActive ? 'available' : 'occupied'} />
                  </div>

                  <h4 className="text-lg font-semibold mb-1">{lot.name}</h4>
                  <p className="text-sm text-muted-foreground mb-4">{lot.addressText ?? 'Address not set'}</p>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Occupancy</p>
                      <p className="font-medium text-foreground">{lot.capacityTotal} total</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Today's Revenue</p>
                      <p className="font-medium text-accent">KES 0</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Sidebar: Quick Actions & Notifications (Placeholder) */}
          <div className="lg:col-span-4 space-y-6">
            <h3 className="text-xl font-semibold">Quick Actions</h3>
            <div className="grid grid-cols-1 gap-4">
              <Button
                onClick={() => navigate('/owner/todays-bookings')}
                className="h-auto py-4 rounded-3xl bg-secondary hover:bg-secondary/80 border-2 border-transparent hover:border-primary text-foreground flex items-center justify-start px-6 gap-4 transition-all"
              >
                <div className="p-3 bg-white rounded-2xl shadow-sm">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <div className="text-left">
                  <span className="block font-semibold">Today's Bookings</span>
                  <span className="text-xs text-muted-foreground">View check-ins</span>
                </div>
              </Button>

              <Button
                onClick={() => navigate('/owner/analytics')}
                className="h-auto py-4 rounded-3xl bg-secondary hover:bg-secondary/80 border-2 border-transparent hover:border-accent text-foreground flex items-center justify-start px-6 gap-4 transition-all"
              >
                <div className="p-3 bg-white rounded-2xl shadow-sm">
                  <TrendingUp className="w-6 h-6 text-accent" />
                </div>
                <div className="text-left">
                  <span className="block font-semibold">Performance</span>
                  <span className="text-xs text-muted-foreground">View detailed analytics</span>
                </div>
              </Button>
            </div>

            {/* Simple list of recent activity could go here */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-border/50">
              <h4 className="font-semibold mb-4">Recent Activity</h4>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="flex-1 text-muted-foreground">New booking at Downtown Plaza</span>
                    <span className="text-xs text-muted-foreground">2m ag</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}