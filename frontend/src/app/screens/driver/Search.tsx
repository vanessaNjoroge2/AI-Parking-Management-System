import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Search as SearchIcon, MapPin, Calendar, Clock, SlidersHorizontal, History } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

export function Search() {
  const navigate = useNavigate();
  const [destination, setDestination] = useState('');

  const recentSearches = [
    'Downtown Plaza',
    'City Mall',
    'Airport Terminal 2',
  ];

  const handleSearch = () => {
    if (destination) {
      navigate('/map-results');
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 h-full">
        {/* Left Column: Search Controls */}
        <div className="lg:col-span-5 flex flex-col justify-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl font-bold tracking-tight text-primary">Find your perfect<br />parking spot.</h2>
            <p className="text-lg text-muted-foreground">Book instantly, park safely, and pay seamlessly.</p>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-border/50">
            {/* Search Input */}
            <div className="relative mb-4">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
              <Input
                type="text"
                placeholder="Enter destination"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="pl-12 pr-12 h-14 bg-secondary rounded-2xl border-0"
              />
              <button className="absolute right-4 top-1/2 -translate-y-1/2">
                <SearchIcon className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="flex items-center gap-2 px-4 py-3 bg-secondary rounded-2xl">
                <Calendar className="w-5 h-5 text-primary" />
                <span className="text-sm">Today</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-3 bg-secondary rounded-2xl">
                <Clock className="w-5 h-5 text-primary" />
                <span className="text-sm">Now</span>
              </div>
            </div>

            {/* Filters */}
            <button className="w-full flex items-center justify-center gap-2 py-3 border-2 border-border rounded-2xl hover:bg-secondary transition-colors mb-6">
              <SlidersHorizontal className="w-5 h-5 text-primary" />
              <span>Filters</span>
            </button>

            <Button
              onClick={handleSearch}
              className="w-full h-14 rounded-2xl bg-primary text-white text-lg font-medium"
            >
              Search Parking
            </Button>
          </div>
        </div>

        {/* Right Column: Recent Searches & Map Preview */}
        <div className="lg:col-span-7 flex flex-col space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Recent Searches</h3>
            <button
              onClick={() => navigate('/booking-history')}
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              <History className="w-4 h-4" />
              View History
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {recentSearches.map((search, index) => (
              <button
                key={index}
                onClick={() => {
                  setDestination(search);
                  navigate('/map-results');
                }}
                className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all border border-border/50 group"
              >
                <div className="p-3 bg-secondary rounded-xl group-hover:bg-primary/10 transition-colors">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-foreground">{search}</p>
                  <p className="text-xs text-muted-foreground">Last visited 2 days ago</p>
                </div>
              </button>
            ))}

            {/* Add a "New Search" placeholder card to fill grid */}
            <button className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-border rounded-2xl hover:bg-secondary/50 transition-colors text-muted-foreground h-full min-h-[88px]">
              <SearchIcon className="w-5 h-5" />
              <span>New Search</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}