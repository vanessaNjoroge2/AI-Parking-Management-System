import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { ArrowLeft, Star, MapPin, Shield, Camera, Car, Zap, ChevronLeft, ChevronRight, Info, Eye, Accessibility } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { StatusBadge } from '../../components/StatusBadge';
import { getParkingLotDetails, getPrimaryPricing, normalizeParkingLot, NormalizedParkingLot } from '../../services/parkingLots';

import { getApiBaseUrl } from '../../services/apiClient';

// Helper to fix image URLs
const getImageUrl = (url?: string) => {
  if (!url) return 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&q=80&w=800';
  if (url.startsWith('http')) return url;
  return `${getApiBaseUrl()}${url}`;
};

export function LotDetails() {

  const navigate = useNavigate();
  const location = useLocation();
  const initialLot = location.state?.lot as NormalizedParkingLot | undefined;
  const [lot, setLot] = useState<NormalizedParkingLot | undefined>(initialLot);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const lotId = useMemo(() => {
    if (initialLot?.id) return initialLot.id;
    const params = new URLSearchParams(location.search);
    return params.get('id') ?? undefined;
  }, [initialLot?.id, location.search]);

  useEffect(() => {
    if (!lotId) return;
    let isMounted = true;

    const load = async () => {
      setIsLoading(true);
      setError('');
      try {
        const data = await getParkingLotDetails(lotId);
        if (isMounted) {
          setLot(normalizeParkingLot(data));
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Unable to load parking lot');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [lotId]);

  // Redirect if no data (e.g., direct access)
  if (!lot && !isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <p className="text-muted-foreground">{error || 'No parking lot selected.'}</p>
        <Button onClick={() => navigate('/map-results')}>Go to Map</Button>
      </div>
    );
  }

  if (!lot) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <p className="text-muted-foreground">Loading parking lot details...</p>
      </div>
    );
  }

  const images = useMemo(() => {
    if (lot.photos && lot.photos.length > 0) {
      return lot.photos.map(p => getImageUrl(p.url));
    }
    return [
      'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=800',
    ];
  }, [lot.photos]);


  const pricing = getPrimaryPricing(lot);
  const amenities = [
    { icon: Car, label: lot.isCovered ? 'Covered Parking' : 'Open / Surface', active: lot.isCovered },
    { icon: Zap, label: 'EV Charging Available', active: lot.hasEvCharging },
    { icon: Accessibility, label: 'Wheelchair Friendly', active: lot.wheelchairFriendly },
    { icon: Shield, label: lot.isGuarded ? '24/7 Guarded' : 'Standard Security', active: lot.isGuarded },
    { icon: Camera, label: 'CCTV Monitoring', active: lot.hasCctv },
    { icon: Info, label: lot.addressText || 'Nairobi Area', active: !!lot.addressText },
  ];

  const vehicleSizes = lot.allowedVehicleSizes || ['standard'];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 flex justify-center">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left Column: Image Gallery */}
        <div className="space-y-4">
          {/* Navigation Back Button - Desktop Placement */}
          <div className="hidden lg:block mb-4">
            <button
              onClick={() => navigate('/map-results')}
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Map</span>
            </button>
          </div>

          <div className="relative aspect-video bg-slate-100 rounded-lg overflow-hidden shadow-sm border border-slate-200">
            <img
              src={images[currentImageIndex]}
              alt="Parking lot"
              className="w-full h-full object-cover"
            />

            {/* Mobile Navigation */}
            <button
              onClick={() => navigate('/map-results')}
              className="absolute top-6 left-6 p-2 bg-white rounded-md shadow-lg lg:hidden"
            >
              <ArrowLeft className="w-5 h-5 text-slate-900" />
            </button>

            {/* Image Controls */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-between px-4">
              <button
                onClick={prevImage}
                className="p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-primary" />
              </button>
              <button
                onClick={nextImage}
                className="p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-primary" />
              </button>
            </div>

            {/* Dots Indicator */}
            <div className="absolute bottom-4 inset-x-0 flex justify-center gap-2">
              {images.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                />
              ))}
            </div>
          </div>

          {/* Thumbnail Preview (New for Desktop) */}
          <div className="hidden lg:grid grid-cols-3 gap-4">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentImageIndex(idx)}
                className={`aspect-video rounded-md overflow-hidden border-2 transition-all ${idx === currentImageIndex ? 'border-blue-600 ring-2 ring-blue-600/10' : 'border-transparent opacity-70 hover:opacity-100'}`}
              >
                <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Details & Booking */}
        <div className="bg-card p-6 md:p-8 rounded-lg shadow-sm border border-border lg:sticky lg:top-8">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 text-left">
                <h2 className="text-3xl font-semibold mb-2 text-foreground tracking-tight">{lot.name}</h2>
                <div className="flex items-center gap-2 text-slate-500 mb-3">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">Coordinates: {lot.lat.toFixed(4)}, {lot.lng.toFixed(4)}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-amber-50 border border-amber-100 px-3 py-1 rounded-md">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span className="text-sm font-semibold text-amber-700">4.5</span>
              </div>
            </div>

            <StatusBadge status={lot.isActive ? 'available' : 'occupied'} />
          </div>

          {/* Price */}
          <div className="bg-muted rounded-lg p-6 mb-8 border border-border">
            <div className="flex items-center justify-between">
              <div className="text-left">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Pricing</p>
                <p className="text-3xl font-bold text-blue-600">
                  {pricing.isFree ? 'Free' : `${pricing.currency} ${pricing.amount}`}
                  <span className="text-lg font-normal text-slate-400">{!pricing.isFree && `/${pricing.type.toLowerCase()}`}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Capacity</p>
                <p className="text-xl font-semibold text-foreground">{lot.capacityTotal || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Amenities & Sizes */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 text-foreground border-b border-border pb-2 flex items-center justify-between">
              Facility Features
              <div className="flex gap-1.5">
                {vehicleSizes.map(size => (
                  <span key={size} className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-100">
                    {size}
                  </span>
                ))}
              </div>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {amenities.filter(a => a.active).map((amenity, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 px-4 py-3 bg-white border border-slate-100 rounded-md transition-all hover:border-blue-100 hover:bg-slate-50/50"
                >
                  <amenity.icon className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-slate-600">{amenity.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Availability */}
          <div className="mb-10">
            <h3 className="text-lg font-semibold mb-3 text-foreground font-inter">Current Occupancy</h3>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-500"
                    style={{ width: `${(Math.floor(lot.capacityTotal * 0.2) / lot.capacityTotal) * 100}%` }}
                  />
                </div>
              </div>
              <span className="text-sm font-bold text-slate-900 font-inter whitespace-nowrap">
                {lot.capacityTotal - Math.floor(lot.capacityTotal * 0.2)}/{lot.capacityTotal} Spots
              </span>
            </div>
          </div>

          {/* Book Button */}
          <Button
            onClick={() => navigate('/booking-form', { state: { lot } })}
            className="w-full h-14 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold shadow-blue-600/10 shadow-lg transition-all"
            disabled={!lot.isActive}
          >
            {!lot.isActive ? 'Facility Closed' : 'Continue to Booking'}
          </Button>
        </div>
      </div>
    </div>
  );
}
