import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, SlidersHorizontal, Map as MapIcon, List, Search, Loader2 } from 'lucide-react';
import { MapComponent } from '../../components/map/MapComponent';
import { CustomMarker } from '../../components/map/CustomMarker';
import { FilterPanel, FilterState } from '../../components/map/FilterPanel';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { StatusBadge } from '../../components/StatusBadge';
import { useMap } from 'react-leaflet';
import {
  getPrimaryPricing,
  normalizeParkingLot,
  ParkingLot,
  NormalizedParkingLot,
  searchParkingLots,
} from '../../services/parkingLots';

// Helper to center map
function MapController({ center }: { center: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 14, { duration: 1.5 });
    }
  }, [center, map]);
  return null;
}

export function MapResults() {
  const navigate = useNavigate();
  const [selectedLotId, setSelectedLotId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [loadError, setLoadError] = useState('');

  // Default Center: Nairobi CBD (User Provided: 1.2896 S, 36.8151 E)
  const [mapCenter, setMapCenter] = useState<[number, number]>([-1.2896, 36.8151]);

  // Data State
  const [allLots, setAllLots] = useState<NormalizedParkingLot[]>([]);

  // Filter State
  const [filters, setFilters] = useState<FilterState>({
    radius: 1000,
    types: [],
    access: [],
    fee: [],
  });

  // Fetch Data when Center or Radius changes
  useEffect(() => {
    const loadParking = async () => {
      setIsLoadingData(true);
      setLoadError('');
      try {
        const lots = await searchParkingLots(mapCenter[0], mapCenter[1], filters.radius / 1000);
        const normalized = lots
          .map(normalizeParkingLot)
          .filter((lot) => Number.isFinite(lot.lat) && Number.isFinite(lot.lng));
        setAllLots(normalized);
      } catch (error) {
        setAllLots([]);
        setLoadError(error instanceof Error ? error.message : 'Failed to load parking lots');
      }
      setIsLoadingData(false);
    };

    // Debounce slightly to avoid rapid calls if center changes fast
    const timer = setTimeout(loadParking, 500);
    return () => clearTimeout(timer);
  }, [mapCenter, filters.radius]);

  // Search Logic (Nominatim)
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + ' Kenya')}`);
      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        setMapCenter([parseFloat(lat), parseFloat(lon)]);
      }
    } catch (error) {
      console.error("Geocoding error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  // Filter Logic (Client-side)
  const getLotType = (lot: ParkingLot) => (lot.isCovered ? 'covered' : 'surface');
  const getLotAccess = (lot: ParkingLot) => (lot.isActive ? 'public' : 'private');
  const getLotFee = (lot: ParkingLot) => (getPrimaryPricing(lot).isFree ? 'no' : 'yes');

  const visibleLots = useMemo(() => {
    return allLots.filter((lot) => {
      // 1. Type Filter
      const type = getLotType(lot);
      if (filters.types.length > 0 && !filters.types.includes(type)) return false;

      // 2. Access Filter
      const access = getLotAccess(lot);
      if (filters.access.length > 0 && !filters.access.includes(access)) return false;

      // 3. Fee Filter
      const fee = getLotFee(lot);
      if (filters.fee.length > 0 && !filters.fee.includes(fee)) return false;

      return true;
    });
  }, [filters, allLots]);

  const handleBook = (id: string) => {
    const lot = allLots.find(l => l.id === id);
    if (lot) {
      navigate('/lot-details', { state: { lot } });
    }
  };

  return (
    <div className="h-screen w-full flex flex-col md:flex-row bg-background overflow-hidden relative">

      {/* HEADER / SEARCH BAR (Floating) */}
      <div className="absolute top-4 left-4 right-4 md:left-[470px] z-[400] flex gap-2 pointer-events-none">
        <form onSubmit={handleSearch} className="flex-1 pointer-events-auto shadow-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder="Search location (e.g. Garden City Mall)"
              className="pl-10 h-12 rounded-2xl bg-white border-0 text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {isSearching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-primary w-5 h-5" />}
          </div>
        </form>

        {/* Mobile Toggle & Filter Button */}
        <div className="flex gap-2 pointer-events-auto">
          <Button
            size="icon"
            className="h-12 w-12 rounded-2xl shadow-xl bg-white text-foreground hover:bg-secondary"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="w-5 h-5" />
          </Button>
          <Button
            size="icon"
            className="md:hidden h-12 w-12 rounded-2xl shadow-xl bg-primary text-white"
            onClick={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}
          >
            {viewMode === 'map' ? <List className="w-5 h-5" /> : <MapIcon className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* FILTER PANEL */}
      <div className={`
        fixed inset-y-0 left-0 w-full md:w-[450px] bg-white z-[600] 
        transition-transform duration-300 shadow-2xl
        ${showFilters ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <FilterPanel
          filters={filters}
          onFilterChange={setFilters}
          onClose={() => setShowFilters(false)}
        />
      </div>

      {/* RESULT LIST SIDEBAR */}
      <div className={`
        ${viewMode === 'list' && !showFilters ? 'flex' : 'hidden'} 
        md:flex flex-col 
        w-full md:w-[450px] 
        h-full bg-white z-[500] shadow-xl 
        md:relative absolute inset-0 pt-24 md:pt-[88px]
      `}>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="flex justify-between items-baseline mb-2">
            <h2 className="text-xl font-semibold">
              {isLoadingData ? 'Searching...' : `${visibleLots.length} Results`}
            </h2>
            <span className="text-sm text-muted-foreground">
              within {filters.radius / 1000}km
            </span>
          </div>

          {isLoadingData && (
            <div className="flex justify-center p-8">
              <Loader2 className="animate-spin w-8 h-8 text-primary" />
            </div>
          )}

          {!isLoadingData && visibleLots.length === 0 && (
            <div className="text-center py-10 text-muted-foreground">
              <p>{loadError || 'No parking found in this area.'}</p>
              <Button variant="link" onClick={() => navigate(0)}>
                Reset
              </Button>
            </div>
          )}

          {visibleLots.map((lot) => (
            <div
              key={lot.id}
              onClick={() => {
                setSelectedLotId(lot.id);
                setMapCenter([lot.lat, lot.lng]); // Center on click
                if (window.innerWidth < 768) setViewMode('map');
              }}
              className={`
                    p-4 rounded-2xl border transition-all cursor-pointer hover:shadow-md
                    ${selectedLotId === lot.id ? 'border-primary ring-1 ring-primary bg-primary/5' : 'border-border bg-white'}
                  `}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg">{lot.name}</h3>
                {/* Use Access as Status for now since functionality is limited */}
                <StatusBadge status={lot.isActive ? 'available' : 'occupied'} />
              </div>
              <p className="text-sm text-muted-foreground mb-3 capitalize">
                {getLotType(lot).replace('_', ' ') || 'Surface Parking'}
              </p>

              {/* Features Badge Row */}
              <div className="flex flex-wrap gap-1 mb-3">
                {getLotFee(lot) && (
                  <span className="text-[10px] uppercase font-bold bg-secondary text-secondary-foreground px-2 py-1 rounded-md">
                    {getLotFee(lot) === 'no' ? 'Free' : 'Paid'}
                  </span>
                )}
                {getLotAccess(lot) && (
                  <span className="text-[10px] uppercase font-bold bg-secondary text-secondary-foreground px-2 py-1 rounded-md">
                    {getLotAccess(lot)}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <Button
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); handleBook(lot.id); }}
                  className="rounded-full px-6 w-full"
                >
                  Directions / Book
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t md:hidden">
          <Button variant="outline" className="w-full" onClick={() => navigate('/search')}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Button>
        </div>
      </div>

      {/* MAP AREA */}
      <div className="flex-1 relative h-full w-full">
        <MapComponent
          center={mapCenter}
          zoom={14}
          className="h-full w-full z-0"
          // We control bounds via center/radius updates now, so bound changes are less critical for data fetching loop
          onBoundsChanged={() => { }}
        >
          <MapController center={mapCenter} />
          {visibleLots.map((lot) => {
            const pricing = getPrimaryPricing(lot);
            return (
              <CustomMarker
                key={lot.id}
                id={lot.id}
                position={[lot.lat, lot.lng]}
                title={lot.name}
                price={pricing.isFree ? 0 : pricing.amount}
                status={lot.isActive ? 'available' : 'occupied'}
                fee={pricing.isFree ? 'no' : 'yes'}
                access={getLotAccess(lot)}
                type={getLotType(lot)}
                onBook={handleBook}
              />
            );
          })}
        </MapComponent>

        {/* Loading Overlay Map */}
        {isLoadingData && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[400] bg-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
            <Loader2 className="animate-spin w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Scanning area...</span>
          </div>
        )}
      </div>
    </div>
  );
}
