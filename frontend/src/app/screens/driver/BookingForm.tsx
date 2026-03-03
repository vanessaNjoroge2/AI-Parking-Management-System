import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { ArrowLeft, Calendar, Car } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Calendar as CalendarComponent } from '../../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover';
import { format } from 'date-fns';
import { TimePicker } from '../../components/TimePicker';
import { getPrimaryPricing, NormalizedParkingLot } from '../../services/parkingLots';

export function BookingForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const lot = location.state?.lot as NormalizedParkingLot | undefined;

  const [date, setDate] = useState<Date>(new Date());
  const dateString = format(date, 'yyyy-MM-dd');
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
          date: dateString,
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
                className="p-2 hover:bg-muted rounded-md transition-colors border border-border"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </button>
              <div className="text-left">
                <h2 className="text-3xl font-semibold tracking-tight text-foreground">Confirm Booking</h2>
                <p className="text-slate-500">{lot.name}</p>
              </div>
            </div>

            <div className="bg-card p-6 md:p-8 rounded-lg shadow-sm border border-border space-y-6">
              {/* Date Selection */}
              <div className="flex flex-col gap-2 text-left">
                <label className="text-sm font-semibold text-foreground uppercase tracking-wider">Arrival Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="w-full flex items-center justify-between px-4 py-3 bg-muted rounded-md border border-border focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 text-foreground text-left"
                    >
                      <span>{format(date, 'PPP')}</span>
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-[500]" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={date}
                      onSelect={(d) => d && setDate(d)}
                      initialFocus
                      disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                    />
                  </PopoverContent>
                </Popover>
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
              <div className="flex flex-col gap-2 text-left">
                <label className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Vehicle Plate Number</label>
                <div className="relative">
                  <Car className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="e.g., KCA 123A"
                    value={plate}
                    onChange={(e) => setPlate(e.target.value.toUpperCase())}
                    className="pl-12 h-12 bg-slate-50 rounded-md border-slate-200"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-5 lg:sticky lg:top-8">
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 md:p-8">
              <h3 className="text-xl font-semibold mb-6 text-slate-900 border-b border-slate-100 pb-2">Order Summary</h3>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Parking Location</span>
                  <span className="font-semibold text-slate-900 text-right max-w-[200px] truncate">{lot.name}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Unit Rate</span>
                  <span className="font-semibold text-slate-900">
                    {pricing.currency} {hourlyRate} / {pricing.type.toLowerCase()}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Estimated Duration</span>
                  <span className="font-semibold text-slate-900">{duration.toFixed(1)} hours</span>
                </div>
                <div className="h-px bg-slate-100 my-2" />
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-slate-900">Total payable</span>
                  <span className="text-3xl font-bold text-blue-600">KES {total.toFixed(0)}</span>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-md p-4 mb-6 text-sm text-slate-500">
                <p>Calculated based on selected arrival and departure times. Final amount may vary based on actual exit time.</p>
              </div>

              <Button
                type="submit"
                className="w-full h-14 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold shadow-blue-600/10 shadow-lg transition-all"
                disabled={!plate || duration <= 0}
              >
                Continue to Secure Payment
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
