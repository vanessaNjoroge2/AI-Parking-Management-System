import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import {
  PlusCircle,
  TrendingUp,
  Users,
  DollarSign,
  MapPin,
  MoreVertical,
  BarChart3,
  Calendar as CalendarIcon,
  Filter,
  Download,
  ChevronDown,
  Clock,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { StatusBadge } from "../../components/StatusBadge";
import { getOwnerParkingLots, ParkingLot } from "../../services/parkingLots";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover";
import { Calendar } from "../../components/ui/calendar";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import { DateRange } from "react-day-picker";
import { cn } from "../../components/ui/utils";
import { downloadOwnerReportCsv } from "../../services/analytics";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  fetchOwnerBookings,
  type OwnerBookingRecord,
} from "../../services/ownerBookings";
import { getStoredAuth } from "../../services/authStorage";
import { downloadOwnerReport } from "../../services/analytics";

export function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const preservedFilters = (
    location.state as
      | {
          ownerFilters?: {
            dateFrom?: string;
            dateTo?: string;
            statusFilter?: "all" | "confirmed" | "pending" | "cancelled";
            lotFilter?: string;
            searchQuery?: string;
          };
        }
      | undefined
  )?.ownerFilters;
  const [lots, setLots] = useState<ParkingLot[]>([]);
  const [ownerBookings, setOwnerBookings] = useState<OwnerBookingRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedLotId, setSelectedLotId] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");
  const [startTime, setStartTime] = useState("00:00");
  const [endTime, setEndTime] = useState("23:59");
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: subDays(new Date(), 7),
    to: new Date(),
  });

  const [isFacilityOpen, setIsFacilityOpen] = useState(false);
  const [isDateOpen, setIsDateOpen] = useState(false);
  const auth = getStoredAuth();

  const ownerFiltersForBookings = useMemo(
    () => ({
      dateFrom: preservedFilters?.dateFrom,
      dateTo: preservedFilters?.dateTo,
      statusFilter: preservedFilters?.statusFilter ?? "all",
      lotFilter: preservedFilters?.lotFilter ?? "all",
      searchQuery: preservedFilters?.searchQuery ?? "",
    }),
    [
      preservedFilters?.dateFrom,
      preservedFilters?.dateTo,
      preservedFilters?.lotFilter,
      preservedFilters?.searchQuery,
      preservedFilters?.statusFilter,
    ],
  );
  // const handleDownloadFullReport = async () => {
  //   try {
  //     await downloadOwnerReport({
  //       from: date?.from ? format(date.from, "yyyy-MM-dd") : undefined,
  //       to: date?.to ? format(date.to, "yyyy-MM-dd") : undefined,
  //       parkingLotId: selectedLotId !== "all" ? selectedLotId : undefined,
  //     });
  //   } catch (err) {
  //     console.error("Failed to download report:", err);
  //     alert("Failed to download report");
  //   }
  // };

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError("");
      try {
        const [lotsData, bookingsData] = await Promise.all([
          getOwnerParkingLots(),
          fetchOwnerBookings(),
        ]);
        setLots(lotsData);
        setOwnerBookings(bookingsData);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to load dashboard",
        );
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  const stats = useMemo(() => {
    const totalLots = lots.length;
    const activeLots = lots.filter((lot) => lot.isActive).length;
    const totalCapacity = lots.reduce((sum, lot) => sum + lot.capacityTotal, 0);
    const occupiedSpots = lots.reduce(
      (sum, lot) => sum + (lot.occupiedSpots ?? 0),
      0,
    );
    const occupancyRate =
      totalCapacity === 0
        ? 0
        : Math.round((occupiedSpots / totalCapacity) * 100);
    const revenueToday = ownerBookings.reduce(
      (sum, booking) => sum + (booking.payment?.amount ?? 0),
      0,
    );

    return [
      {
        label: "Total Lots",
        value: String(totalLots),
        icon: MapPin,
        color: "text-accent",
        bg: "bg-accent/10",
      },
      {
        label: "Revenue Today",
        value: `KES ${revenueToday.toLocaleString()}`,
        icon: DollarSign,
        color: "text-primary",
        bg: "bg-primary/10",
      },
      {
        label: "Occupancy Rate",
        value: `${occupancyRate}%`,
        icon: TrendingUp,
        color: "text-warning",
        bg: "bg-warning/10",
      },
    ];
  }, [lots, ownerBookings]);

  const filteredLots = useMemo(() => {
    let result = [...lots];

    if (selectedLotId !== "all") {
      result = result.filter((lot) => lot.id === selectedLotId);
    }

    if (selectedStatus === "active") {
      result = result.filter((lot) => lot.isActive);
    } else if (selectedStatus === "inactive") {
      result = result.filter((lot) => !lot.isActive);
    }

    if (sortBy === "occupancy") {
      result.sort((a, b) => (b.occupiedSpots ?? 0) - (a.occupiedSpots ?? 0));
    } else if (sortBy === "yield") {
      const revenueByLot = ownerBookings.reduce<Record<string, number>>(
        (acc, booking) => {
          acc[booking.parkingLotId] =
            (acc[booking.parkingLotId] ?? 0) + (booking.payment?.amount ?? 0);
          return acc;
        },
        {},
      );
      result.sort(
        (a, b) => (revenueByLot[b.id] ?? 0) - (revenueByLot[a.id] ?? 0),
      );
    } else {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [lots, ownerBookings, selectedLotId, selectedStatus, sortBy]);

  const hourlyData = useMemo(() => {
    const sourceBookings =
      selectedLotId === "all"
        ? ownerBookings
        : ownerBookings.filter(
            (booking) => booking.parkingLotId === selectedLotId,
          );

    const data = [];
    for (let i = 0; i < 24; i++) {
      const hour = i.toString().padStart(2, "0") + ":00";
      const todayCount = sourceBookings.filter((booking) => {
        const bookingDate = new Date(booking.startTime);
        const bookingHour = bookingDate.getHours();
        return bookingHour === i;
      }).length;
      data.push({
        hour,
        today: todayCount,
        yesterday: Math.max(todayCount - 1, 0),
      });
    }
    return data;
  }, [selectedLotId, date, ownerBookings]);

  const handleDownloadFullReport = async () => {
    try {
      await downloadOwnerReport({
        from: date?.from ? format(date.from, "yyyy-MM-dd") : undefined,
        to: date?.to ? format(date.to, "yyyy-MM-dd") : undefined,
        parkingLotId: selectedLotId !== "all" ? selectedLotId : undefined,
      });
    } catch (err) {
      console.error("Failed to download report:", err);
      alert("Failed to download report");
    }
  };
  const handleDownloadCsvReport = async () => {
    try {
      await downloadOwnerReportCsv({
        from: date?.from ? format(date.from, "yyyy-MM-dd") : undefined,
        to: date?.to ? format(date.to, "yyyy-MM-dd") : undefined,
        parkingLotId: selectedLotId !== "all" ? selectedLotId : undefined,
      });
    } catch (err) {
      console.error("Failed to download CSV report:", err);
      alert("Failed to download CSV report");
    }
  };
  const reportInsights = useMemo(() => {
    const avgCars =
      ownerBookings.length === 0
        ? 0
        : Math.round(
            ownerBookings.reduce(
              (sum, booking) => sum + booking.numberOfCars,
              0,
            ) / ownerBookings.length,
          );
    const peakHour = hourlyData.reduce(
      (max, item) => (item.today > max.today ? item : max),
      hourlyData[0] ?? { hour: "--:--", today: 0 },
    );
    const monthlyRevenue = ownerBookings.reduce(
      (sum, booking) => sum + (booking.payment?.amount ?? 0),
      0,
    );
    return [
      {
        label: "Avg Cars Parked",
        value: String(avgCars),
        icon: Users,
        trend: `${ownerBookings.length} bookings`,
        color: "text-blue-600",
      },
      {
        label: "Peak Parking Time",
        value: peakHour?.hour ?? "--:--",
        icon: Clock,
        trend: "Today",
        color: "text-purple-600",
      },
      {
        label: "Collected Revenue",
        value: `KES ${monthlyRevenue.toLocaleString()}`,
        icon: DollarSign,
        trend: "From recorded payments",
        color: "text-emerald-600",
      },
    ];
  }, [hourlyData, ownerBookings]);

  const selectedLotName = useMemo(() => {
    if (selectedLotId === "all") return "All Facilities";
    return (
      lots.find((l) => l.id === selectedLotId)?.name ?? "Selected Facility"
    );
  }, [selectedLotId, lots]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header / Nav */}
      <div className="bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 flex items-center justify-between">
          <div className="text-left">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] mb-1">
              Owner Account
            </p>
            <h2 className="text-2xl font-semibold tracking-tight">
              {auth?.user.fullName ?? "Owner Account"}
            </h2>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() =>
                navigate("/owner/analytics", {
                  state: { ownerFilters: ownerFiltersForBookings },
                })
              }
              className="bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white rounded-md h-10 px-4"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Insights
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 space-y-12">
        {/* Filters Section */}
        <div className="flex flex-col lg:flex-row items-end gap-x-4 gap-y-6 p-7 bg-white rounded-2xl border border-slate-200 shadow-sm">
          {/* Parking Lot Filter */}
          <div className="flex-[1.2] w-full space-y-2 relative">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5 font-inter">
              <MapPin className="w-3 h-3" />
              Parking Lot
            </label>
            <Button
              variant="outline"
              onClick={() => {
                setIsFacilityOpen(!isFacilityOpen);
                setIsDateOpen(false);
              }}
              className="w-full justify-between h-12 bg-slate-50 border-slate-200 font-medium hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <span>{selectedLotName}</span>
              </div>
              <ChevronDown
                className={cn(
                  "w-4 h-4 text-slate-400 transition-transform",
                  isFacilityOpen && "rotate-180",
                )}
              />
            </Button>

            {isFacilityOpen && (
              <div className="absolute top-[calc(100%+8px)] left-0 w-full z-[9999] p-2 bg-white rounded-lg shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
                <div className="max-h-[300px] overflow-y-auto space-y-1 custom-scrollbar">
                  <button
                    onClick={() => {
                      setSelectedLotId("all");
                      setIsFacilityOpen(false);
                    }}
                    className={cn(
                      "w-full text-left px-4 py-3 rounded-md text-sm transition-all font-semibold",
                      selectedLotId === "all"
                        ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                        : "text-slate-600 hover:bg-blue-50 hover:text-blue-700 active:bg-blue-100",
                    )}
                  >
                    All Facilities
                  </button>
                  {lots.map((lot) => (
                    <button
                      key={lot.id}
                      onClick={() => {
                        setSelectedLotId(lot.id);
                        setIsFacilityOpen(false);
                      }}
                      className={cn(
                        "w-full text-left px-4 py-2.5 rounded-md text-sm transition-all font-medium border-l-2",
                        selectedLotId === lot.id
                          ? "bg-blue-50 border-blue-600 text-blue-700 shadow-sm"
                          : "border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 hover:border-slate-300",
                      )}
                    >
                      {lot.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Date Picker - Enhanced Visibility */}
          <div className="flex-1 w-full space-y-2 relative">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 font-inter flex items-center gap-1.5">
              <CalendarIcon className="w-3 h-3" />
              Date Window
            </label>
            <Button
              variant="outline"
              onClick={() => {
                setIsDateOpen(!isDateOpen);
                setIsFacilityOpen(false);
              }}
              className={cn(
                "w-full justify-start text-left font-semibold h-12 bg-slate-50 border-slate-200 hover:bg-slate-100",
                !date && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="mr-3 h-4 w-4 text-black" />
              <span className="text-slate-900">
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "MMM dd, y")} —{" "}
                      {format(date.to, "MMM dd, y")}
                    </>
                  ) : (
                    format(date.from, "MMM dd, y")
                  )
                ) : (
                  "Select date range"
                )}
              </span>
            </Button>

            {isDateOpen && (
              <div className="absolute top-[calc(100%+8px)] left-0 z-[9999] bg-white p-2 rounded-lg shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 min-w-max">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={(newDate) => {
                    setDate(newDate);
                    if (newDate?.from && newDate?.to) {
                      // Optionally close on range completion, but keep open for user flexibility
                    }
                  }}
                  numberOfMonths={2}
                  className="rounded-md border-0 bg-white"
                />
                <div className="p-2 border-t border-slate-100 flex justify-end">
                  <Button
                    size="sm"
                    onClick={() => setIsDateOpen(false)}
                    className="bg-slate-900 text-white rounded-md"
                  >
                    Apply Filter
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Extra Filters Row Group */}
          <div className="grid grid-cols-1 gap-3 w-full lg:w-auto">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 font-inter">
                Facility Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full lg:w-36 h-12 px-3 bg-slate-50 border border-slate-200 rounded-md text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all cursor-pointer hover:bg-slate-100"
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 font-inter">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full lg:w-36 h-12 px-3 bg-slate-50 border border-slate-200 rounded-md text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all cursor-pointer hover:bg-slate-100"
              >
                <option value="occupancy">Occupancy</option>
                <option value="yield">Gross Yield</option>
              </select>
            </div>
          </div>

          {/* Time Picker Group */}
          <div className="flex gap-3 w-full lg:w-auto">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 font-inter">
                Start
              </label>
              <select
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-24 h-12 px-3 bg-slate-50 border border-slate-200 rounded-md text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all cursor-pointer hover:bg-slate-100"
              >
                {Array.from({ length: 24 }).map((_, i) => {
                  const h = i.toString().padStart(2, "0") + ":00";
                  return (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 font-inter">
                End
              </label>
              <select
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-24 h-12 px-3 bg-slate-50 border border-slate-200 rounded-md text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all cursor-pointer hover:bg-slate-100"
              >
                {Array.from({ length: 24 }).map((_, i) => {
                  const h = i.toString().padStart(2, "0") + ":00";
                  return (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <Button className="w-full lg:w-auto h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg shadow-blue-600/20 active:scale-[0.98] transition-all">
            Update View
          </Button>
        </div>

        {/* Dropdown Overlays (Click outside to close) */}
        {(isFacilityOpen || isDateOpen) && (
          <div
            className="fixed inset-0 z-[9998] bg-transparent"
            onClick={() => {
              setIsFacilityOpen(false);
              setIsDateOpen(false);
            }}
          />
        )}

        {/* Reports Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xl font-semibold text-slate-900">
              Performance Insights
            </h3>
            <Button
              variant="ghost"
              size="sm"
              className="text-blue-600 font-semibold hover:bg-blue-50"
              onClick={handleDownloadFullReport}
            >
              <Download className="w-4 h-4 mr-2" />
              Download PDF Report
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-emerald-600 font-semibold hover:bg-emerald-50"
              onClick={handleDownloadCsvReport}
            >
              <Download className="w-4 h-4 mr-2" />
              Download CSV
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reportInsights.map((insight, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-sm border border-slate-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={cn(
                      "p-2 rounded-lg bg-slate-50",
                      insight.color
                        .replace("text-", "bg-")
                        .replace("600", "50"),
                    )}
                  >
                    <insight.icon className={cn("w-5 h-5", insight.color)} />
                  </div>
                  <span
                    className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full",
                      insight.trend.startsWith("+")
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-slate-50 text-slate-400",
                    )}
                  >
                    {insight.trend}
                  </span>
                </div>
                <p className="text-2xl font-bold text-slate-900 mb-1">
                  {insight.value}
                </p>
                <p className="text-xs font-medium text-slate-500">
                  {insight.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Hourly Comparison Chart */}
        <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-8">
            <div className="text-left">
              <h3 className="text-lg font-bold text-slate-900">
                Hourly Occupancy Comparison
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Real-time traffic compared to previous period
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-blue-600 rounded-sm shadow-sm" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Active Forecast
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-[#e2e8f0] rounded-sm shadow-sm border border-slate-300/50" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Previous Record
                </span>
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={hourlyData}
                margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="hour"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 600 }}
                  interval={3}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 600 }}
                />
                <Tooltip
                  cursor={{ fill: "#f8fafc" }}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Bar
                  dataKey="today"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                  barSize={24}
                />
                <Bar
                  dataKey="yesterday"
                  fill="#cbd5e1"
                  radius={[4, 4, 0, 0]}
                  barSize={24}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-6 shadow-sm border border-slate-200 flex items-center gap-5 hover:border-slate-300 transition-all group"
            >
              <div
                className={`p-4 rounded-md border ${stat.bg.replace("/10", "/5")} ${stat.color.replace("text-", "border-")}/20`}
              >
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </div>
              <div className="text-left">
                <p className="text-3xl font-bold text-slate-900 tracking-tighter group-hover:text-blue-600 transition-colors">
                  {stat.value}
                </p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  {stat.label}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions & Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Content: Parking Lots */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="text-xl font-semibold text-slate-900">
                Registered Facilities
              </h3>
              <Button
                onClick={() => navigate("/owner/add-lot")}
                className="rounded-md bg-blue-600 text-white flex items-center gap-2 hover:bg-blue-700 shadow-blue-600/10 shadow-lg px-6"
              >
                <PlusCircle className="w-5 h-5" />
                Register Lot
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {isLoading && (
                <div className="col-span-full py-12 text-center text-slate-400 italic">
                  Synchronizing facility data...
                </div>
              )}

              {!isLoading && error && (
                <div className="col-span-full py-6 px-4 bg-red-50 border border-red-100 rounded-md text-red-600 text-center">
                  {error}
                </div>
              )}

              {!isLoading && !error && filteredLots.length === 0 && (
                <div className="col-span-full py-20 bg-slate-100/50 border-2 border-dashed border-slate-200 rounded-lg text-center">
                  <p className="text-slate-400 font-medium">
                    No active facilities found in your portfolio.
                  </p>
                  <Button
                    variant="link"
                    onClick={() => navigate("/owner/add-lot")}
                    className="text-blue-600"
                  >
                    Register your first lot
                  </Button>
                </div>
              )}

              {!isLoading &&
                !error &&
                filteredLots.map((lot) => {
                  const occupancy = lot.occupiedSpots ?? 0;
                  const lotRevenue = ownerBookings
                    .filter((booking) => booking.parkingLotId === lot.id)
                    .reduce(
                      (sum, booking) => sum + (booking.payment?.amount ?? 0),
                      0,
                    );
                  return (
                    <button
                      key={lot.id}
                      onClick={() =>
                        navigate("/owner/edit-lot", { state: { lot } })
                      }
                      className="bg-white rounded-lg p-6 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all border border-slate-200 text-left group flex flex-col h-full"
                    >
                      <div className="flex justify-between items-start mb-6">
                        <div className="p-3 bg-slate-50 rounded-md border border-slate-100 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">
                          <MapPin className="w-6 h-6 text-slate-400 group-hover:text-blue-600" />
                        </div>
                        <StatusBadge
                          status={lot.isActive ? "available" : "occupied"}
                        />
                      </div>

                      <h4 className="text-lg font-semibold text-slate-900 mb-1 leading-tight group-hover:text-blue-600 transition-colors">
                        {lot.name}
                      </h4>
                      <p className="text-sm text-slate-500 mb-auto line-clamp-2">
                        {lot.addressText ?? "Address unavailable"}
                      </p>

                      <div className="grid grid-cols-2 gap-4 pt-6 mt-6 border-t border-slate-100">
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">
                            Live Occupancy
                          </p>
                          <p className="text-sm font-semibold text-slate-900">
                            <span className="text-blue-600">{occupancy}</span> /{" "}
                            {lot.capacityTotal} Occupied
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">
                            Gross Yield
                          </p>
                          <p className="text-sm font-semibold text-emerald-600">
                            KES {lotRevenue.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>

          {/* Sidebar: Quick Actions & Notifications */}
          <div className="lg:col-span-4 space-y-8">
            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-6 border-b border-slate-200 pb-2">
                Quick Commands
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <Button
                  onClick={() =>
                    navigate("/owner/todays-bookings", {
                      state: { filters: ownerFiltersForBookings },
                    })
                  }
                  className="h-auto py-5 rounded-lg bg-white border border-slate-200 hover:border-blue-600 hover:bg-blue-50/30 text-slate-900 flex items-center justify-start px-6 gap-5 transition-all shadow-sm group"
                >
                  <div className="p-3 bg-slate-100 rounded-md group-hover:bg-white shadow-sm transition-colors border border-slate-200">
                    <CalendarIcon className="w-6 h-6 text-slate-600 group-hover:text-blue-600" />
                  </div>
                  <div className="text-left">
                    <span className="block font-semibold">
                      Today&apos;s Bookings
                    </span>
                    <span className="text-xs text-slate-500">
                      {ownerBookings.length} bookings today
                    </span>
                  </div>
                </Button>

                <Button
                  onClick={() => navigate("/owner/analytics")}
                  className="h-auto py-5 rounded-lg bg-white border border-slate-200 hover:border-blue-600 hover:bg-blue-50/30 text-slate-900 flex items-center justify-start px-6 gap-5 transition-all shadow-sm group"
                >
                  <div className="p-3 bg-slate-100 rounded-md group-hover:bg-white shadow-sm transition-colors border border-slate-200">
                    <TrendingUp className="w-6 h-6 text-slate-600 group-hover:text-blue-600" />
                  </div>
                  <div className="text-left">
                    <span className="block font-semibold">
                      Analytics Overview
                    </span>
                    <span className="text-xs text-slate-500">
                      Revenue and occupancy trends
                    </span>
                  </div>
                </Button>
              </div>
            </div>

            {/* Recent activity */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                <div className="w-1 h-3 bg-blue-600 rounded-full" />
                Activity overview
              </h4>
              <div className="space-y-6">
                {[
                  {
                    text: ownerBookings[0]
                      ? `Latest booking at ${ownerBookings[0].parkingLot?.name ?? "your parking lot"}`
                      : "No recent bookings yet",
                    time: ownerBookings[0]
                      ? format(
                          new Date(ownerBookings[0].startTime),
                          "MMM dd, hh:mm a",
                        )
                      : "Waiting for new activity",
                    color: "bg-emerald-500",
                  },
                  {
                    text: lots[0]
                      ? `Largest lot: ${lots[0].name}`
                      : "No parking lots added yet",
                    time: lots[0]
                      ? `${lots[0].capacityTotal} total spaces`
                      : "Create your first parking lot",
                    color: "bg-blue-500",
                  },
                  {
                    text: "Occupancy and revenue metrics update from live booking data",
                    time: "Live dashboard data",
                    color: "bg-amber-500",
                  },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm">
                    <div
                      className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${item.color}`}
                    />
                    <div className="flex-1 text-left">
                      <p className="text-slate-900 font-medium leading-none mb-1">
                        {item.text}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">
                        {item.time}
                      </p>
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
