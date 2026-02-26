import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { ArrowLeft, SlidersHorizontal, Map as MapIcon, List, Search, Loader2, Star, Navigation, Info } from 'lucide-react';
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
  ParkingPhoto,
} from '../../services/parkingLots';
import { getApiBaseUrl } from '../../services/apiClient';

// Helper to fix image URLs
const getImageUrl = (photo?: ParkingPhoto) => {
  if (!photo?.url) return 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&q=80&w=400';
  if (photo.url.startsWith('http')) return photo.url;
  return `${getApiBaseUrl()}${photo.url}`;
};

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
  const location = useLocation();
  const [selectedLotId, setSelectedLotId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [showFilters, setShowFilters] = useState(location.state?.showFilters || false);
  const [searchQuery, setSearchQuery] = useState(location.state?.destination || '');
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [loadError, setLoadError] = useState('');

  const [mapCenter, setMapCenter] = useState<[number, number]>([-1.2896, 36.8151]);
  const [allLots, setAllLots] = useState<NormalizedParkingLot[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    radius: 1000,
    types: [],
    access: [],
    fee: [],
  });

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

    const timer = setTimeout(loadParking, 500);
    return () => clearTimeout(timer);
  }, [mapCenter, filters.radius]);

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

  const getLotType = (lot: ParkingLot) => (lot.isCovered ? 'covered' : 'surface');
  const getLotAccess = (lot: ParkingLot) => (lot.isActive ? 'public' : 'private');
  const getLotFee = (lot: ParkingLot) => (getPrimaryPricing(lot).isFree ? 'no' : 'yes');

  const visibleLots = useMemo(() => {
    return allLots.filter((lot) => {
      const type = getLotType(lot);
      if (filters.types.length > 0 && !filters.types.includes(type)) return false;
      const access = getLotAccess(lot);
      if (filters.access.length > 0 && !filters.access.includes(access)) return false;
      const fee = getLotFee(lot);
      if (filters.fee.length > 0 && !filters.fee.includes(fee)) return false;
      return true;
    });
  }, [filters, allLots]);

  const handleBook = (id: string | ParkingLot | NormalizedParkingLot) => {
    const lot = typeof id === 'string' ? allLots.find(l => l.id === id) : id;
    if (lot) {
      navigate('/lot-details', { state: { lot } });
    }
  };

  const selectedLot = useMemo(() => allLots.find(l => l.id === selectedLotId), [selectedLotId, allLots]);

  return (
    <div className="h-screen w-full flex flex-col md:flex-row bg-background overflow-hidden relative">

      {/* HEADER / SEARCH BAR */}
      <div className="absolute top-4 left-4 right-4 md:left-[470px] z-[400] flex gap-2 pointer-events-none">
        <Button
          size="icon"
          className="h-12 w-12 rounded-2xl shadow-xl bg-white text-foreground hover:bg-secondary pointer-events-auto"
          onClick={() => navigate('/search')}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>

        <form onSubmit={handleSearch} className="flex-1 pointer-events-auto shadow-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder="Search destination..."
              className="pl-10 h-12 rounded-2xl bg-white border-0 text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {isSearching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-primary w-5 h-5" />}
          </div>
        </form>

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
        fixed inset-y-0 left-0 w-full md:w-[450px] bg-white z-[602] 
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
          <div className="flex justify-between items-baseline mb-2 px-2">
            <h2 className="text-xl font-bold">
              {isLoadingData ? 'Searching...' : `${visibleLots.length} Parking Lots`}
            </h2>
          </div>

          {!isLoadingData && visibleLots.length === 0 && (
            <div className="text-center py-20 text-muted-foreground">
              <Info className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>{loadError || 'No results found in this area.'}</p>
              <Button variant="link" onClick={() => navigate(0)}>Reset search</Button>
            </div>
          )}

          {visibleLots.map((lot) => (
            <div
              key={lot.id}
              onClick={() => {
                setSelectedLotId(lot.id);
                setMapCenter([lot.lat, lot.lng]);
                if (window.innerWidth < 768) setViewMode('map');
              }}
              className={`
                p-4 rounded-3xl border transition-all cursor-pointer group
                ${selectedLotId === lot.id
                  ? 'border-primary bg-primary/5 ring-1 ring-primary'
                  : 'border-border bg-white hover:border-primary/50'}
              `}
            >
              <div className="flex gap-4">
                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-secondary flex-shrink-0">
                  <img
                    src={getImageUrl(lot.photos?.[0])}
                    alt={lot.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-lg truncate pr-2">{lot.name}</h3>
                    <StatusBadge status={lot.isActive ? 'available' : 'occupied'} />
                  </div>
                  <p className="text-xs text-muted-foreground truncate mb-2">{lot.addressText || 'Nairobi, Kenya'}</p>

                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star className="w-3 h-3 fill-current" />
                      <span className="text-xs font-bold">4.8</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                      {getLotType(lot)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-bold text-primary">
                      KES {getPrimaryPricing(lot).amount}
                      <span className="text-[10px] text-muted-foreground font-normal">/hr</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MAP AREA */}
      <div className="flex-1 relative h-full w-full">
        <MapComponent
          center={mapCenter}
          zoom={14}
          className="h-full w-full z-0"
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
                onBook={() => setSelectedLotId(lot.id)}
              />
            );
          })}
        </MapComponent>

        {/* FIXED DETAIL CARD (Requested) */}
        {selectedLot && (
          <div className="absolute bottom-6 left-6 right-6 md:left-auto md:w-[380px] z-[400] animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="bg-white rounded-[2.5rem] shadow-2xl p-6 border border-border/50 relative overflow-hidden group">
              <button
                onClick={() => setSelectedLotId(null)}
                className="absolute top-4 right-4 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors"
              >
                <SlidersHorizontal className="w-4 h-4 rotate-90" />
              </button>

              <div className="flex gap-4 mb-4">
                <div className="w-24 h-24 rounded-[1.5rem] overflow-hidden bg-secondary">
                  <img src={getImageUrl(selectedLot.photos?.[0])} className="w-full h-full object-cover" alt="" />
                </div>
                <div className="flex-1 py-1">
                  <h3 className="font-bold text-xl mb-1">{selectedLot.name}</h3>
                  <div className="flex items-center gap-1 text-amber-500 mb-2">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm font-bold">4.8 (120 reviews)</span>
                  </div>
                  <div className="flex gap-2">
                    <StatusBadge status={selectedLot.isActive ? 'available' : 'occupied'} />
                    <span className="bg-secondary text-[10px] font-bold uppercase py-1 px-2 rounded-lg">
                      {getLotType(selectedLot)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  onClick={() => handleBook(selectedLot)}
                  className="flex-1 h-14 rounded-2xl bg-primary text-white text-lg font-bold"
                >
                  Book KES {getPrimaryPricing(selectedLot).amount}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-14 w-14 rounded-2xl border-2"
                >
                  <Navigation className="w-6 h-6 text-primary" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Scanning Overlay */}
        {isLoadingData && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[400] bg-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border border-border">
            <Loader2 className="animate-spin w-5 h-5 text-primary" />
            <span className="text-sm font-bold text-primary">Scanning Nairobi...</span>
          </div>
        )}
      </div>
    </div>
  );
}
