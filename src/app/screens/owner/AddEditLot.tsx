import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, MapPin, DollarSign, Hash, Camera } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';

export function AddEditLot() {
  const navigate = useNavigate();
  const [amenities, setAmenities] = useState({
    security: true,
    cctv: true,
    covered: false,
    evCharging: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/owner/dashboard');
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
          <h2 className="text-3xl font-bold tracking-tight">Add Parking Lot</h2>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Media & Basic Info */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-border/50 space-y-6">
              {/* Photos */}
              <div>
                <label className="text-sm font-medium text-foreground mb-4 block">Parking Photos</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    className="aspect-video bg-secondary rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 hover:bg-muted transition-colors group"
                  >
                    <div className="p-4 bg-white rounded-full shadow-sm group-hover:scale-110 transition-transform">
                      <Camera className="w-6 h-6 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">Add Main Photo</span>
                  </button>
                  <button
                    type="button"
                    className="aspect-video bg-secondary/50 rounded-2xl border-2 border-dashed border-border/50 flex flex-col items-center justify-center gap-2 hover:bg-muted transition-colors"
                  >
                    <span className="text-3xl text-muted-foreground/50">+</span>
                  </button>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Parking Lot Name</label>
                <Input
                  type="text"
                  placeholder="e.g., Downtown Plaza Parking"
                  className="h-14 bg-white rounded-2xl border border-border"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Description</label>
                <Textarea
                  placeholder="Describe your parking lot..."
                  className="bg-white rounded-2xl border border-border min-h-[120px] resize-none"
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
              >
                Save Parking Lot
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
