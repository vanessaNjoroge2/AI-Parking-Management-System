import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { ArrowLeft, Calendar, Car } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { TimePicker } from '../../components/TimePicker';
import { getPrimaryPricing, NormalizedParkingLot } from '../../services/parkingLots';

export function BookingForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const lot = location.state?.lot as NormalizedParkingLot | undefined;

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('11:00');
  const [plate, setPlate] = useState('');

  // Rate Calculation (Mock logic based on ID if fee is not explicit "no")
  const pricing = lot ? getPrimaryPricing(lot) : { amount: 0, currency: 'KES', type: 'FLAT', isFree: true };
  const hourlyRate = pricing.isFree ? 0 : pricing.amount;

  // Redirect if no data
  if (!lot) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <p className="text-muted-foreground">No parking lot selected.</p>
        <Button onClick={() => navigate('/map-results')}>Go to Map</Button>
      </div>
    );
  }

  // Move calculations up so they can be used in handleSubmit
  const calculateDuration = () => {
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    let diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    if (diff < 0) diff += 24; // Handle overnight
    return diff;
  };

  const duration = calculateDuration();
  const total = duration * hourlyRate;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/payment', {
      state: {
        lot,
        bookingDetails: {
          date,
          startTime,
          endTime,
          plate,
          duration,
          totalCost: total
        }
      }
    });
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 flex justify-center">
      <div className="max-w-6xl w-full">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form Details */}
          <div className="lg:col-span-7 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4 mb-2">
              <button
                type="button"
                onClick={() => navigate('/lot-details', { state: { lot } })}
                className="p-2 hover:bg-secondary rounded-xl transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-primary" />
              </button>
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-primary">Booking Details</h2>
                <p className="text-muted-foreground">{lot.name}</p>
              </div>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-border/50 space-y-6">
              {/* Date Selection */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground">Date</label>
                <div className="relative">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-3 bg-white rounded-2xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/20"
                    min={new Date().toISOString().split('T')[0]}
                  />
                  <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              {/* Time Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TimePicker
                  label="Start Time"
                  value={startTime}
                  onChange={setStartTime}
                />
                <TimePicker
                  label="End Time"
                  value={endTime}
                  onChange={setEndTime}
                />
              </div>

              {/* Vehicle Information */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground">Vehicle Plate Number</label>
                <div className="relative">
                  <Car className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
                  <Input
                    type="text"
                    placeholder="e.g., KCA 123A"
                    value={plate}
                    onChange={(e) => setPlate(e.target.value.toUpperCase())}
                    className="pl-12 h-14 bg-white rounded-2xl border border-border"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-5 lg:sticky lg:top-8">
            <div className="bg-white rounded-3xl border border-border/50 shadow-sm p-6 md:p-8">
              <h3 className="text-xl font-semibold mb-6">Order Summary</h3>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Parking Location</span>
                  <span className="font-medium text-right max-w-[200px] truncate">{lot.name}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Rate</span>
                  <span className="font-medium">
                    {pricing.currency} {hourlyRate} / {pricing.type.toLowerCase()}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-medium">{duration.toFixed(1)} hours</span>
                </div>
                <div className="h-px bg-border my-2" />
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-3xl font-bold text-primary">KES {total.toFixed(0)}</span>
                </div>
              </div>

              <div className="bg-secondary/30 rounded-2xl p-4 mb-6 text-sm text-muted-foreground">
                <p>Cancellation is free up to 1 hour before start time.</p>
              </div>

              <Button
                type="submit"
                className="w-full h-14 rounded-2xl bg-primary text-white text-lg font-medium shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
                disabled={!plate || duration <= 0}
              >
                Continue to Payment
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
