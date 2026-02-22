import React, { useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { ArrowLeft, MapPin, DollarSign, Hash, Camera } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import {
  createParkingLot,
  ParkingLot,
  setParkingLotPricing,
  setParkingLotWorkingHours,
  updateParkingLot,
} from '../../services/parkingLots';

export function AddEditLot() {
  const navigate = useNavigate();
  const location = useLocation();
  const lot = (location.state as { lot?: ParkingLot })?.lot;
  const isEditing = Boolean(lot);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [name, setName] = useState(lot?.name ?? '');
  const [description, setDescription] = useState(lot?.description ?? '');
  const [addressText, setAddressText] = useState(lot?.addressText ?? '');
  const [latitude, setLatitude] = useState(lot ? Number(lot.latitude) : 0);
  const [longitude, setLongitude] = useState(lot ? Number(lot.longitude) : 0);
  const [capacityTotal, setCapacityTotal] = useState(lot?.capacityTotal ?? 0);
  const [price, setPrice] = useState(lot?.pricingRules?.[0]?.amount ?? 0);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<string[]>(
    lot?.photos?.map((photo) => photo.url) ?? [],
  );
  const [amenities, setAmenities] = useState({
    security: lot?.isGuarded ?? true,
    cctv: lot?.hasCctv ?? true,
    covered: lot?.isCovered ?? false,
    evCharging: false,
  });

  const defaultWorkingHours = useMemo(
    () =>
      Array.from({ length: 7 }).map((_, index) => ({
        dayOfWeek: index,
        opensAt: '08:00',
        closesAt: '20:00',
        isClosed: false,
      })),
    [],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const payload = {
        name,
        description: description || undefined,
        addressText: addressText || undefined,
        latitude,
        longitude,
        capacityTotal,
        isGuarded: amenities.security,
        hasCctv: amenities.cctv,
        isCovered: amenities.covered,
      };

      const savedLot = isEditing && lot
        ? await updateParkingLot(lot.id, payload)
        : await createParkingLot(payload);

      await setParkingLotPricing(savedLot.id, {
        type: 'HOURLY',
        amount: price,
        currency: 'KES',
      });

      if (!savedLot.workingHours || savedLot.workingHours.length === 0) {
        await setParkingLotWorkingHours(savedLot.id, defaultWorkingHours);
      }

      navigate('/owner/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save parking lot');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImagePick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    const newUrls = files.map((file) => URL.createObjectURL(file));
    setImages((prev) => [...prev, ...newUrls]);
    event.target.value = '';
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 flex justify-center">
      <div className="max-w-6xl w-full">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/owner/dashboard')}
            className="p-2 hover:bg-secondary rounded-xl transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </button>
          <h2 className="text-3xl font-bold tracking-tight">
            {isEditing ? 'Edit Parking Lot' : 'Add Parking Lot'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Media & Basic Info */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-border/50 space-y-6">
              {/* Photos */}
              <div>
                <label className="text-sm font-medium text-foreground mb-4 block">Parking Photos</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {images.map((src, index) => (
                    <button
                      key={`${src}-${index}`}
                      type="button"
                      onClick={() => removeImage(index)}
                      className="relative aspect-video overflow-hidden rounded-2xl border border-border shadow-sm"
                    >
                      <img src={src} alt={`Parking ${index + 1}`} className="h-full w-full object-cover" />
                      <span className="absolute top-3 right-3 bg-white/90 text-xs px-2 py-1 rounded-full">
                        Remove
                      </span>
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={handleImagePick}
                    className="aspect-video bg-secondary rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 hover:bg-muted transition-colors group"
                  >
                    <div className="p-4 bg-white rounded-full shadow-sm group-hover:scale-110 transition-transform">
                      <Camera className="w-6 h-6 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">
                      {images.length > 0 ? 'Add another photo' : 'Add main photo'}
                    </span>
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>

              {/* Name */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Parking Lot Name</label>
                <Input
                  type="text"
                  placeholder="e.g., Downtown Plaza Parking"
                  className="h-14 bg-white rounded-2xl border border-border"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Description</label>
                <Textarea
                  placeholder="Describe your parking lot..."
                  className="bg-white rounded-2xl border border-border min-h-[120px] resize-none"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Right Column: details & Amenities */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-border/50 space-y-6">
              {/* Address */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Address</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Street address"
                    className="pl-12 h-14 bg-white rounded-2xl border border-border"
                    value={addressText}
                    onChange={(e) => setAddressText(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Latitude</label>
                  <Input
                    type="number"
                    step="0.000001"
                    placeholder="-1.2896"
                    className="h-14 bg-white rounded-2xl border border-border"
                    value={latitude}
                    onChange={(e) => setLatitude(Number(e.target.value))}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Longitude</label>
                  <Input
                    type="number"
                    step="0.000001"
                    placeholder="36.8151"
                    className="h-14 bg-white rounded-2xl border border-border"
                    value={longitude}
                    onChange={(e) => setLongitude(Number(e.target.value))}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Total Spots */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Total Spots</label>
                  <div className="relative">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="number"
                      placeholder="50"
                      className="pl-12 h-14 bg-white rounded-2xl border border-border"
                      value={capacityTotal}
                      onChange={(e) => setCapacityTotal(Number(e.target.value))}
                      required
                    />
                  </div>
                </div>

                {/* Pricing */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Price / Hour</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="number"
                      placeholder="8.00"
                      step="0.01"
                      className="pl-12 h-14 bg-white rounded-2xl border border-border"
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div>
                <label className="text-sm font-medium text-foreground mb-3 block">Amenities</label>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { key: 'security', label: '24/7 Security' },
                    { key: 'cctv', label: 'CCTV Surveillance' },
                    { key: 'covered', label: 'Covered Parking' },
                    { key: 'evCharging', label: 'EV Charging Stations' },
                  ].map((amenity) => (
                    <label
                      key={amenity.key}
                      className="flex items-center justify-between p-4 bg-secondary/30 rounded-2xl border border-border/50 cursor-pointer hover:bg-secondary/60 transition-colors"
                    >
                      <span className="font-medium text-sm">{amenity.label}</span>
                      <input
                        type="checkbox"
                        checked={amenities[amenity.key as keyof typeof amenities]}
                        onChange={(e) => setAmenities({ ...amenities, [amenity.key]: e.target.checked })}
                        className="w-5 h-5 rounded accent-primary"
                      />
                    </label>
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-14 rounded-2xl bg-primary text-white text-lg font-medium shadow-md hover:shadow-lg transition-all"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save Parking Lot'}
              </Button>

              {error && (
                <p className="text-sm text-destructive text-center">{error}</p>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
