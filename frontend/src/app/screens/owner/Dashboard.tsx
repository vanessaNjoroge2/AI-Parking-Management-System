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
    <div className="min-h-screen bg-slate-50">
      {/* Header / Nav */}
      <div className="bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 flex items-center justify-between">
          <div className="text-left">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] mb-1">Facility Partner</p>
            <h2 className="text-2xl font-semibold tracking-tight">John Doe</h2>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => navigate('/owner/analytics')}
              className="bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white rounded-md h-10 px-4"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Insights
            </Button>
            <button className="p-2.5 bg-slate-800 rounded-md border border-slate-700 hover:bg-slate-700 transition-colors">
              <MoreVertical className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 space-y-10">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg p-6 shadow-sm border border-slate-200 flex items-center gap-5 hover:border-slate-300 transition-all group">
              <div className={`p-4 rounded-md border ${stat.bg.replace('/10', '/5')} ${stat.color.replace('text-', 'border-')}/20`}>
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </div>
              <div className="text-left">
                <p className="text-3xl font-bold text-slate-900 tracking-tighter group-hover:text-blue-600 transition-colors">{stat.value}</p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions & Main Content */}
        <div className="grid grid-cols-1 lg:col-span-12 gap-10">
          {/* Main Content: Parking Lots */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="text-xl font-semibold text-slate-900">Registered Facilities</h3>
              <Button
                onClick={() => navigate('/owner/add-lot')}
                className="rounded-md bg-blue-600 text-white flex items-center gap-2 hover:bg-blue-700 shadow-blue-600/10 shadow-lg px-6"
              >
                <PlusCircle className="w-5 h-5" />
                Register Lot
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {isLoading && (
                <div className="col-span-full py-12 text-center text-slate-400 italic">Synchronizing facility data...</div>
              )}

              {!isLoading && error && (
                <div className="col-span-full py-6 px-4 bg-red-50 border border-red-100 rounded-md text-red-600 text-center">{error}</div>
              )}

              {!isLoading && !error && lots.length === 0 && (
                <div className="col-span-full py-20 bg-slate-100/50 border-2 border-dashed border-slate-200 rounded-lg text-center">
                  <p className="text-slate-400 font-medium">No active facilities found in your portfolio.</p>
                  <Button variant="link" onClick={() => navigate('/owner/add-lot')} className="text-blue-600">Register your first lot</Button>
                </div>
              )}

              {!isLoading && !error && lots.map((lot) => (
                <button
                  key={lot.id}
                  onClick={() => navigate('/owner/edit-lot', { state: { lot } })}
                  className="bg-white rounded-lg p-6 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all border border-slate-200 text-left group flex flex-col h-full"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-3 bg-slate-50 rounded-md border border-slate-100 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">
                      <MapPin className="w-6 h-6 text-slate-400 group-hover:text-blue-600" />
                    </div>
                    <StatusBadge status={lot.isActive ? 'available' : 'occupied'} />
                  </div>

                  <h4 className="text-lg font-semibold text-slate-900 mb-1 leading-tight group-hover:text-blue-600 transition-colors">{lot.name}</h4>
                  <p className="text-sm text-slate-500 mb-auto line-clamp-2">{lot.addressText ?? 'Nairobi Regional Cluster'}</p>

                  <div className="grid grid-cols-2 gap-4 pt-6 mt-6 border-t border-slate-100">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Capacity</p>
                      <p className="text-sm font-semibold text-slate-900">{lot.capacityTotal} Bays</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Gross Yield</p>
                      <p className="text-sm font-semibold text-emerald-600">KES 0.00</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Sidebar: Quick Actions & Notifications */}
          <div className="lg:col-span-4 space-y-8">
            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-6 border-b border-slate-200 pb-2">Quick Commands</h3>
              <div className="grid grid-cols-1 gap-4">
                <Button
                  onClick={() => navigate('/owner/todays-bookings')}
                  className="h-auto py-5 rounded-lg bg-white border border-slate-200 hover:border-blue-600 hover:bg-blue-50/30 text-slate-900 flex items-center justify-start px-6 gap-5 transition-all shadow-sm group"
                >
                  <div className="p-3 bg-slate-100 rounded-md group-hover:bg-white shadow-sm transition-colors border border-slate-200">
                    <Calendar className="w-6 h-6 text-slate-600 group-hover:text-blue-600" />
                  </div>
                  <div className="text-left">
                    <span className="block font-semibold">Live Traffic</span>
                    <span className="text-xs text-slate-500">View check-ins & flow</span>
                  </div>
                </Button>

                <Button
                  onClick={() => navigate('/owner/analytics')}
                  className="h-auto py-5 rounded-lg bg-white border border-slate-200 hover:border-blue-600 hover:bg-blue-50/30 text-slate-900 flex items-center justify-start px-6 gap-5 transition-all shadow-sm group"
                >
                  <div className="p-3 bg-slate-100 rounded-md group-hover:bg-white shadow-sm transition-colors border border-slate-200">
                    <TrendingUp className="w-6 h-6 text-slate-600 group-hover:text-blue-600" />
                  </div>
                  <div className="text-left">
                    <span className="block font-semibold">Yield Analytics</span>
                    <span className="text-xs text-slate-500">Historical performance</span>
                  </div>
                </Button>
              </div>
            </div>

            {/* Recent activity */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                <div className="w-1 h-3 bg-blue-600 rounded-full" />
                Audit Trail
              </h4>
              <div className="space-y-6">
                {[
                  { text: 'Entry scan: KCA 451B', time: '2m ago', color: 'bg-emerald-500' },
                  { text: 'Booking finalized: Lot A', time: '15m ago', color: 'bg-blue-500' },
                  { text: 'Peak occupancy alert', time: '1h ago', color: 'bg-amber-500' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm">
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${item.color}`} />
                    <div className="flex-1 text-left">
                      <p className="text-slate-900 font-medium leading-none mb-1">{item.text}</p>
                      <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">{item.time}</p>
                    </div>
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