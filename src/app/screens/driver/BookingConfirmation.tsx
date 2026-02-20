import React from 'react';
import { useNavigate, useLocation } from 'react-router';
import { CheckCircle, MapPin, Calendar, Clock, Car, Download, Share2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { StatusBadge } from '../../components/StatusBadge';
import { ParkingLot } from '../../services/overpass';

interface BookingDetails {
  date: string;
  startTime: string;
  endTime: string;
  plate: string;
  duration: number;
  totalCost: number;
}

export function BookingConfirmation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { lot, bookingDetails } = (location.state as { lot: ParkingLot; bookingDetails: BookingDetails }) || {};

  // Mock Booking ID
  const bookingId = `PKS-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

  // Redirect if missing data
  if (!lot || !bookingDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <p className="text-muted-foreground">No booking found.</p>
        <Button onClick={() => navigate('/map-results')}>Go to Map</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 flex items-center justify-center">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-border/50">
          {/* Success Header */}
          <div className="bg-emerald-600 px-8 py-12 text-center relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-1/2 translate-y-1/2" />

            <div className="flex justify-center mb-6 relative z-10">
              <div className="bg-white p-4 rounded-full shadow-lg">
                <CheckCircle className="w-16 h-16 text-emerald-600" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2 relative z-10">Booking Confirmed!</h2>
            <p className="text-white/90 text-lg relative z-10">Your spot at {lot.name} is reserved.</p>
          </div>

          <div className="p-8">
            <div className="flex flex-col md:flex-row gap-8 items-center mb-8">
              {/* QR Code */}
              <div className="flex-shrink-0">
                <div className="bg-white p-4 rounded-2xl border-2 border-dashed border-primary/20 shadow-sm">
                  <div className="w-40 h-40 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center relative overflow-hidden">
                    {/* Simulated QR Code pattern */}
                    <div className="absolute inset-0 bg-white/10" />
                    <svg width="120" height="120" viewBox="0 0 120 120" fill="white">
                      <rect x="0" y="0" width="20" height="20" />
                      <rect x="50" y="0" width="20" height="20" />
                      <rect x="100" y="0" width="20" height="20" />
                      <rect x="0" y="50" width="20" height="20" />
                      <rect x="50" y="50" width="20" height="20" />
                      <rect x="100" y="50" width="20" height="20" />
                      <rect x="0" y="100" width="20" height="20" />
                      <rect x="50" y="100" width="20" height="20" />
                      <rect x="100" y="100" width="20" height="20" />
                    </svg>
                  </div>
                  <p className="text-center text-xs font-mono mt-2 text-muted-foreground">SCAN AT ENTRY</p>
                </div>
              </div>

              {/* Key Details */}
              <div className="flex-1 w-full space-y-4">
                <div className="bg-secondary/50 rounded-2xl p-4 text-center border border-border/50">
                  <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Booking Code</p>
                  <p className="text-3xl font-mono font-bold tracking-widest text-primary">{bookingId}</p>
                </div>

                <div className="flex justify-center">
                  <StatusBadge status="confirmed" />
                </div>
              </div>
            </div>

            {/* Detailed Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 bg-secondary/20 p-6 rounded-3xl border border-border/50">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-semibold text-foreground line-clamp-1" title={lot.name}>{lot.name}</p>
                  <p className="text-sm text-muted-foreground">Lat: {lot.lat.toFixed(4)}, Lng: {lot.lng.toFixed(4)}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-semibold text-foreground">{bookingDetails.date}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Time</p>
                  <p className="font-semibold text-foreground">{bookingDetails.startTime} - {bookingDetails.endTime}</p>
                  <p className="text-sm text-muted-foreground">{bookingDetails.duration.toFixed(1)} Hours</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <Car className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Vehicle</p>
                  <p className="font-semibold text-foreground">{bookingDetails.plate}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col md:flex-row gap-4">
              <Button
                onClick={() => navigate('/map-results')}
                className="flex-1 h-12 rounded-xl bg-primary text-white hover:bg-primary/90 shadow-md"
              >
                Book Another Spot
              </Button>

              <Button
                variant="outline"
                className="flex-1 h-12 rounded-xl border-2 hover:bg-secondary flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download Ticket
              </Button>

              <Button
                variant="outline"
                className="h-12 w-12 rounded-xl border-2 hover:bg-secondary flex items-center justify-center"
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
