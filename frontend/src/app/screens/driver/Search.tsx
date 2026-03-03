import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Search as SearchIcon, X, Calendar, Clock, SlidersHorizontal, History, TrendingUp, LocateFixed } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Calendar as CalendarComponent } from '../../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover';
import { format, isSameDay, startOfToday } from 'date-fns';
import { fetchMyBookings, BookingRecord } from '../../services/bookings';

export function Search() {
  const navigate = useNavigate();
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState<Date>(new Date());
  const [time, setTime] = useState(format(new Date(), 'HH:mm'));
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const cached = localStorage.getItem('parksmart:last-location');
    if (cached) {
      setDestination(cached);
    }
  }, []);

  useEffect(() => {
    const loadRecentSearches = async () => {
      setIsLoadingHistory(true);
      try {
        const bookings = await fetchMyBookings();
        // Extract unique parking lot names from bookings
        const names = Array.from(new Set(bookings
          .map(b => b.parkingLot?.name)
          .filter(Boolean))) as string[];
        setRecentSearches(names.slice(0, 3));
      } catch (error) {
        console.error('Failed to load recent searches:', error);
      } finally {
        setIsLoadingHistory(false);
      }
    };
    loadRecentSearches();
  }, []);

  const handleSearch = () => {
    if (!destination.trim()) {
      setError('Please enter a destination.');
      return;
    }
    setError('');
    localStorage.setItem('parksmart:last-location', destination.trim());
    navigate('/map-results', { state: { destination, date: date.toISOString(), time } });
  };

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported on this device.');
      return;
    }

    setError('');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        let label = 'Current location';

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}`,
          );
          const data = await response.json();
          label = data?.display_name ?? label;
        } catch (err) {
          console.error('Reverse geocoding failed:', err);
        }

        setDestination(label);
        localStorage.setItem('parksmart:last-location', label);
        navigate('/map-results', { state: { coords, date: date.toISOString(), time, destination: label } });
      },
      () => {
        setError('Unable to access your location.');
      },
    );
  };

  const today = startOfToday();
  const minTime = isSameDay(date, today) ? format(new Date(), 'HH:mm') : undefined;

  useEffect(() => {
    if (!minTime) return;
    if (time < minTime) {
      setTime(minTime);
    }
  }, [minTime, time]);


  return (
    <div className="min-h-[calc(100vh-64px)] bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 h-full">
        {/* Left Column: Search Controls */}
        <div className="lg:col-span-5 flex flex-col justify-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl font-bold tracking-tight text-primary">Find your perfect<br />parking spot.</h2>
            <p className="text-lg text-muted-foreground">Book instantly, park safely, and pay seamlessly.</p>
          </div>

          <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
            {/* Search Input */}
            <form
              className="mb-4"
              onSubmit={(event) => {
                event.preventDefault();
                handleSearch();
              }}
            >
              <div className="relative flex items-center bg-muted border border-border rounded-md focus-within:ring-4 focus-within:ring-blue-500/5 focus-within:border-blue-500 transition-all overflow-hidden group">
                <button
                  type="button"
                  onClick={() => {
                    setDestination('');
                    setError('');
                  }}
                  className="absolute left-3 p-1.5 rounded-md hover:bg-slate-200/50 transition-colors"
                >
                  <X className="w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                </button>
                <Input
                  type="text"
                  placeholder="Enter destination in Nairobi"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="pl-12 pr-[170px] h-12 bg-transparent border-none shadow-none focus-visible:ring-0 text-foreground placeholder:text-muted-foreground"
                />
                <div className="absolute right-1.5 flex items-center gap-1.5">
                  <Button
                    type="button"
                    onClick={handleUseLocation}
                    className="h-9 px-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] uppercase tracking-widest rounded-sm shadow-sm transition-all flex items-center gap-1"
                  >
                    <LocateFixed className="w-3 h-3" />
                    Use my location
                  </Button>
                </div>
              </div>
              {destination && (
                <p className="text-[11px] text-slate-500 mt-2">Destination: {destination}</p>
              )}
              {error && (
                <p className="text-xs text-destructive mt-2">{error}</p>
              )}
            </form>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <Popover>
                <PopoverTrigger asChild>
                  <button className="flex items-center gap-3 px-4 py-3 bg-muted border border-border rounded-md hover:bg-muted/80 transition-colors text-left">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">{format(date, 'MMM dd, yyyy')}</span>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 rounded-lg overflow-hidden border-border shadow-xl" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={date}
                    onSelect={(d) => d && setDate(d)}
                    disabled={(d) => d < today}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border border-slate-200 rounded-md text-left">
                <Clock className="w-5 h-5 text-slate-400" />
                <div className="flex flex-col flex-1">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold leading-none mb-0.5">Time</span>
                  <Input
                    type="time"
                    value={time}
                    min={minTime}
                    onChange={(e) => setTime(e.target.value)}
                    className="h-6 border-none bg-transparent p-0 text-sm font-medium text-slate-700 shadow-none focus-visible:ring-0"
                  />
                </div>
              </div>
            </div>

            {/* Filters */}
            <button
              onClick={() => navigate('/map-results', { state: { showFilters: true } })}
              className="w-full flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors mb-6"
            >
              <SlidersHorizontal className="w-4 h-4 text-slate-600" />
              <span className="font-semibold text-sm text-slate-700">Refine Search</span>
            </button>


            <Button
              onClick={handleSearch}
              className="w-full h-12 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold"
            >
              Find Parking
            </Button>
          </div>
        </div>

        {/* Right Column: Popular Searches & Map Preview */}
        <div className="lg:col-span-7 flex flex-col space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-slate-900 tracking-tight">Popular Searches</h3>
            <button
              onClick={() => navigate('/booking-history')}
              className="text-sm text-blue-600 font-semibold hover:underline flex items-center gap-1.5"
            >
              <History className="w-4 h-4" />
              Recent History
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {isLoadingHistory && (
              <div className="col-span-full text-sm text-muted-foreground">Loading recent searches...</div>
            )}

            {!isLoadingHistory && recentSearches.map((search, index) => (
              <button
                key={index}
                onClick={() => {
                  setDestination(search);
                  setError('');
                  navigate('/map-results', { state: { destination: search, date: date.toISOString(), time } });
                }}
                className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm hover:shadow-xl hover:border-blue-200 transition-all border border-slate-200 group text-left"
              >
                <div className="p-3 bg-slate-50 rounded-md group-hover:bg-blue-50 transition-colors">
                  <TrendingUp className="w-5 h-5 text-slate-400 group-hover:text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-slate-900 leading-tight">{search}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">High demand area</p>
                </div>
              </button>
            ))}

            {/* Add a "New Search" placeholder card to fill grid */}
            <button
              type="button"
              onClick={() => {
                setDestination('');
                setError('');
              }}
              className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-400 h-full min-h-[80px]"
            >
              <SearchIcon className="w-4 h-4" />
              <span className="text-sm font-medium">New Search</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}