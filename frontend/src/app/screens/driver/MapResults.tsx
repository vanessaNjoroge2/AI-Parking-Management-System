import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { ArrowLeft, SlidersHorizontal, Map as MapIcon, List, Search, Loader2, Star, Navigation, Info, Zap, Car, Accessibility, Shield, Camera, X } from 'lucide-react';
import { MapComponent } from '../../components/map/MapComponent';
import { CustomMarker } from '../../components/map/CustomMarker';
import { FilterPanel, FilterState } from '../../components/map/FilterPanel';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { StatusBadge } from '../../components/StatusBadge';
import { AdvancedMarker } from '@vis.gl/react-google-maps';
import {
  getPrimaryPricing,
  normalizeParkingLot,
  ParkingLot,
  NormalizedParkingLot,
  PricingType,
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

const defaultCenter: [number, number] = [-1.2896, 36.8151];
const LIVE_REFRESH_MS = 15000;
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
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);

  const [mapCenter, setMapCenter] = useState<[number, number]>(defaultCenter);
  const [allLots, setAllLots] = useState<NormalizedParkingLot[]>([]);
  const [hasFallbackSearch, setHasFallbackSearch] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    radius: 2500,
    types: [],
    access: [],
    fee: [],
  });

  useEffect(() => {
    let cancelled = false;
    let fallbackTimer: number | undefined;

    const loadParking = async (showLoader = true) => {
      if (showLoader) {
        setIsLoadingData(true);
      }
      setLoadError('');
      try {
        const lots = await searchParkingLots(
          mapCenter[0],
          mapCenter[1],
          filters.radius / 1000,
        );
        if (cancelled) return;

        const normalized = lots
          .map(normalizeParkingLot)
          .filter((lot) => Number.isFinite(lot.lat) && Number.isFinite(lot.lng));

        if (normalized.length === 0 && userLocation && !hasFallbackSearch) {
          fallbackTimer = window.setTimeout(() => {
            if (cancelled) return;
            setHasFallbackSearch(true);
            setLoadError('No nearby lots found. Showing Nairobi results instead.');
            setAllLots([]);
            setMapCenter(defaultCenter);
          }, 2000);
          return;
        }

        setAllLots(normalized);
        setLastUpdatedAt(new Date());
      } catch (error) {
        if (cancelled) return;
        setAllLots([]);
        setLoadError(error instanceof Error ? error.message : 'Failed to load parking lots');
      } finally {
        if (!cancelled) {
          setIsLoadingData(false);
        }
      }
    };

    const debounceTimer = window.setTimeout(() => {
      void loadParking(true);
    }, 500);

    const intervalId = window.setInterval(() => {
      if (!document.hidden) {
        void loadParking(false);
      }
    }, LIVE_REFRESH_MS);

    const handleVisibleRefresh = () => {
      if (!document.hidden) {
        void loadParking(false);
      }
    };

    window.addEventListener('focus', handleVisibleRefresh);
    document.addEventListener('visibilitychange', handleVisibleRefresh);

    return () => {
      cancelled = true;
      window.clearTimeout(debounceTimer);
      if (fallbackTimer) window.clearTimeout(fallbackTimer);
      window.clearInterval(intervalId);
      window.removeEventListener('focus', handleVisibleRefresh);
      document.removeEventListener('visibilitychange', handleVisibleRefresh);
    };
  }, [mapCenter, filters.radius, userLocation, hasFallbackSearch]);

  const runSearch = async (query: string) => {
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ' Kenya')}`);
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

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await runSearch(searchQuery);
  };

  useEffect(() => {
    const coords = location.state?.coords as { lat: number; lng: number } | undefined;
    const destination = location.state?.destination as string | undefined;

    if (coords) {
      setSearchQuery(destination ?? 'Current location');
      setMapCenter([coords.lat, coords.lng]);
      setUserLocation([coords.lat, coords.lng]);
      setHasFallbackSearch(false);
      return;
    }

    setUserLocation(null);
    setHasFallbackSearch(false);

    if (destination) {
      setSearchQuery(destination);
      runSearch(destination);
    }
  }, [location.state?.coords, location.state?.destination]);


  const getLotType = (lot: ParkingLot) => (lot.isCovered ? 'covered' : 'surface');
  const getLotAccess = (lot: ParkingLot) => (lot.isActive ? 'public' : 'private');
  const getLotFee = (lot: ParkingLot) => (getPrimaryPricing(lot).isFree ? 'no' : 'yes');
  const getAvailableSpots = (lot: ParkingLot) =>
    lot.availableSpots ?? Math.max(lot.capacityTotal - (lot.occupiedSpots ?? 0), 0);
  const getOccupiedSpots = (lot: ParkingLot) =>
    lot.occupiedSpots ?? Math.max(lot.capacityTotal - getAvailableSpots(lot), 0);
  const getPricingSuffix = (type: PricingType) => {
    switch (type) {
      case 'DAILY':
        return '/day';
      case 'FLAT':
        return '/flat';
      default:
        return '/hr';
    }
  };
  const getReviewSummary = (lot: ParkingLot) => {
    const reviews = lot.reviews ?? [];
    if (reviews.length === 0) {
      return { ratingLabel: 'New', reviewCountLabel: 'No reviews yet' };
    }

    const average =
      reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) /
      reviews.length;

    return {
      ratingLabel: average.toFixed(1),
      reviewCountLabel: `${reviews.length} review${reviews.length === 1 ? '' : 's'}`,
    };
  };

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

  const formatLiveTimestamp = (value: Date | null) => {
    if (!value) return 'Waiting for live data…';
    return `Updated ${value.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  };

  return (
    <div className="h-[calc(100vh-64px)] w-full flex flex-col md:flex-row bg-background overflow-hidden relative">

      {/* HEADER / SEARCH BAR */}
      <div className="absolute top-2 left-4 right-4 md:left-[470px] z-[400] flex gap-2 pointer-events-none">
        <Button
          size="icon"
          className="h-12 w-12 rounded-lg shadow-lg bg-card text-foreground hover:bg-muted border border-border pointer-events-auto"
          onClick={() => navigate('/search')}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>

        <form onSubmit={handleSearch} className="flex-1 pointer-events-auto border border-border rounded-lg bg-card shadow-lg focus-within:ring-4 focus-within:ring-blue-500/5 focus-within:border-blue-500 transition-all overflow-hidden flex items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              placeholder="Search destination..."
              className="pl-10 pr-10 h-12 border-none shadow-none focus-visible:ring-0 text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  localStorage.removeItem('parksmart:last-location');
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-200/60 transition-colors"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            )}
            {isSearching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-blue-600 w-5 h-5" />}
          </div>
        </form>

        <div className="flex gap-2 pointer-events-auto">
          <Button
            type="button"
            onClick={handleSearch}
            className="h-12 px-6 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] uppercase tracking-widest rounded-lg shadow-lg transition-all"
          >
            Enter
          </Button>
          <Button
            size="icon"
            className="h-12 w-12 rounded-lg shadow-lg bg-card text-foreground hover:bg-muted border border-border"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="w-5 h-5" />
          </Button>
          <Button
            size="icon"
            className="md:hidden h-12 w-12 rounded-lg shadow-lg bg-slate-900 text-white"
            onClick={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}
          >
            {viewMode === 'map' ? <List className="w-5 h-5" /> : <MapIcon className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* FILTER PANEL */}
      <div className={`
        fixed inset-y-0 left-0 w-full md:w-[450px] bg-card z-[602] 
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
        md:relative absolute inset-0 pt-14 md:pt-2
      `}>
        <div className="flex-1 overflow-y-auto pt-1 px-4 pb-4 space-y-4">
          <div className="flex justify-between items-baseline mb-2 px-2">
            <h2 className="text-xl font-bold">
              {isLoadingData ? 'Searching...' : `${visibleLots.length} Parking Lots`}
            </h2>
            <span className="text-[11px] font-medium text-slate-400">
              {formatLiveTimestamp(lastUpdatedAt)}
            </span>
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
                p-4 rounded-lg border transition-all cursor-pointer group
                ${selectedLotId === lot.id
                  ? 'border-blue-600 bg-blue-50/10 dark:bg-blue-900/20 ring-1 ring-blue-600'
                  : 'border-border bg-card hover:border-blue-300'}
              `}
            >
              {(() => {
                const pricing = getPrimaryPricing(lot);
                const { ratingLabel } = getReviewSummary(lot);
                return (
              <div className="flex gap-4">
                <div className="w-24 h-24 rounded-md overflow-hidden bg-slate-100 flex-shrink-0">
                  <img
                    src={getImageUrl(lot.photos?.[0])}
                    alt={lot.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-lg text-foreground truncate pr-2">{lot.name}</h3>
                    <StatusBadge status={lot.isActive ? 'available' : 'full'}>
                      {lot.isActive
                        ? <span><span className="text-blue-600 font-bold">{getOccupiedSpots(lot)}</span> / {lot.capacityTotal} Occupied</span>
                        : `Full (0/${lot.capacityTotal})`}
                    </StatusBadge>
                  </div>
                  <p className="text-xs text-slate-500 truncate mb-2">{lot.addressText || 'Address unavailable'}</p>

                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star className="w-3 h-3 fill-current" />
                      <span className="text-xs font-bold">{ratingLabel}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                      {getLotType(lot)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-600">
                      {pricing.isFree ? 'Free' : `${pricing.currency} ${pricing.amount}`}
                      {!pricing.isFree && (
                        <span className="text-[10px] text-slate-400 font-normal">{getPricingSuffix(pricing.type)}</span>
                      )}
                    </span>
                    <span className="text-xs font-medium text-slate-500">
                      {getAvailableSpots(lot)} spots free
                    </span>
                  </div>
                </div>
              </div>
                );
              })()}
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
          {userLocation && (
            <AdvancedMarker position={{ lat: userLocation[0], lng: userLocation[1] }}>
              <div className="w-5 h-5 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse" title="You are here" />
            </AdvancedMarker>
          )}
          {visibleLots.map((lot) => {
            const pricing = getPrimaryPricing(lot);
            return (
              <CustomMarker
                key={lot.id}
                id={lot.id}
                position={[lot.lat, lot.lng]}
                title={lot.name}
                price={pricing.isFree ? 0 : pricing.amount}
                status={lot.isActive ? 'available' : 'full'}
                fee={pricing.isFree ? 'no' : 'yes'}
                access={getLotAccess(lot)}
                type={getLotType(lot)}
                onBook={() => setSelectedLotId(lot.id)}
                opacity={1}
                isCovered={lot.isCovered || false}
                hasEvCharging={lot.hasEvCharging || false}
                wheelchairFriendly={lot.wheelchairFriendly || false}
                allowedVehicleSizes={lot.allowedVehicleSizes}
                totalSpaces={lot.capacityTotal}
                availableSpaces={lot.isActive ? lot.capacityTotal - Math.floor(lot.capacityTotal * 0.4) : 0}
              />
            );
          })}
        </MapComponent>

        {/* FIXED DETAIL CARD */}
        {selectedLot && (
          <div className="absolute bottom-6 left-6 right-6 md:left-auto md:w-[380px] z-[400] animate-in fade-in slide-in-from-bottom-4 duration-300">
            {(() => {
              const pricing = getPrimaryPricing(selectedLot);
              const { ratingLabel, reviewCountLabel } = getReviewSummary(selectedLot);
              return (
            <div className="bg-card rounded-lg shadow-2xl p-6 border border-border relative overflow-hidden group">
              <button
                onClick={() => setSelectedLotId(null)}
                className="absolute top-4 right-4 z-10 p-2 bg-slate-100/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex gap-4 mb-4">
                <div className="w-24 h-24 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                  <img src={getImageUrl(selectedLot.photos?.[0])} className="w-full h-full object-cover" alt="" />
                </div>
                <div className="flex-1 py-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-semibold text-xl text-foreground truncate pr-2">{selectedLot.name}</h3>
                    <div className="flex gap-1">
                      {selectedLot.hasEvCharging && <Zap className="w-4 h-4 text-blue-600" />}
                      {selectedLot.isCovered && <Car className="w-4 h-4 text-slate-400" />}
                      {selectedLot.wheelchairFriendly && <Accessibility className="w-4 h-4 text-slate-400" />}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500 mb-2">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm font-bold">{ratingLabel} · {reviewCountLabel}</span>
                  </div>
                  <div className="flex gap-2">
                    <StatusBadge status={!selectedLot.isActive ? 'full' : getAvailableSpots(selectedLot) <= Math.max(1, Math.ceil(selectedLot.capacityTotal * 0.2)) ? 'low' : 'available'}>
                      {selectedLot.isActive
                        ? <span><span className="text-blue-600 font-bold">{getOccupiedSpots(selectedLot)}</span> / {selectedLot.capacityTotal} Occupied</span>
                        : `Full (0/${selectedLot.capacityTotal})`}
                    </StatusBadge>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="font-bold text-xl text-foreground">
                  {pricing.isFree ? 'Free' : `${pricing.currency} ${pricing.amount}`}
                  {!pricing.isFree && (
                    <span className="text-xs text-slate-500 font-normal ml-0.5">{getPricingSuffix(pricing.type)}</span>
                  )}
                </span>
                <div className="h-4 w-px bg-border" />
                <div className="flex flex-wrap gap-1.5">
                  {(selectedLot.allowedVehicleSizes || ['standard']).map(size => (
                    <span key={size} className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                      {size}
                    </span>
                  ))}
                </div>
              </div>

              {/* FACILITY FEATURES LIKE IN CARD */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                {selectedLot.isGuarded && (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-card border border-border shadow-sm transition-all hover:bg-muted">
                    <Shield className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">24/7 Guarded</span>
                  </div>
                )}
                {selectedLot.hasCctv && (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-card border border-border shadow-sm transition-all hover:bg-muted">
                    <Camera className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">CCTV Monitoring</span>
                  </div>
                )}
                {selectedLot.hasLighting && (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-card border border-border shadow-sm transition-all hover:bg-muted">
                    <Star className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Well Lit</span>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-4">
                <Button
                  onClick={() => handleBook(selectedLot)}
                  className="flex-1 h-12 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-base font-bold tracking-tight"
                >
                  Proceed to Booking
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-12 w-12 rounded-lg border border-border text-muted-foreground hover:bg-muted"
                >
                  <Navigation className="w-5 h-5 text-blue-600" />
                </Button>
              </div>
            </div>
              );
            })()}
          </div>
        )}

        {/* Scanning Overlay */}
        {isLoadingData && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[400] bg-card px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border border-border">
            <Loader2 className="animate-spin w-5 h-5 text-primary" />
            <span className="text-sm font-bold text-primary">Scanning Nairobi...</span>
          </div>
        )}
      </div>
    </div>
  );
}
