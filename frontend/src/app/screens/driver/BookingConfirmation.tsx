import React from 'react';
import { useNavigate, useLocation } from 'react-router';
import { CheckCircle, MapPin, Calendar, Clock, Car, Download, Share2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { StatusBadge } from '../../components/StatusBadge';
import type { BookingStatus } from '../../services/bookings';
import { NormalizedParkingLot } from '../../services/parkingLots';

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
  const { lot, bookingDetails, bookingId, bookingStatus } =
    (location.state as {
      lot: NormalizedParkingLot;
      bookingDetails: BookingDetails;
      bookingId?: string;
      bookingStatus?: BookingStatus;
    }) || {};

  // Mock Booking ID
  const displayBookingId = bookingId
    ? `PKS-${bookingId.slice(0, 8).toUpperCase()}`
    : `PKS-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

  const badgeStatus = bookingStatus
    ? bookingStatus === 'CONFIRMED' || bookingStatus === 'COMPLETED'
      ? 'confirmed'
      : bookingStatus === 'CANCELLED' || bookingStatus === 'REFUNDED' || bookingStatus === 'EXPIRED'
        ? 'cancelled'
        : 'pending'
    : 'confirmed';

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
        <div className="bg-white rounded-lg shadow-2xl overflow-hidden border border-slate-200">
          {/* Success Header */}
          <div className="bg-slate-900 px-8 py-12 text-center relative overflow-hidden">
            {/* Subtle grid pattern background would be nice, but keeping it solid for now */}
            <div className="absolute inset-0 bg-blue-600/5" />

            <div className="flex justify-center mb-6 relative z-10">
              <div className="bg-blue-600 p-4 rounded-lg shadow-lg">
                <CheckCircle className="w-16 h-16 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-semibold text-white mb-2 relative z-10 tracking-tight">Booking Confirmed</h2>
            <p className="text-slate-400 text-lg relative z-10">Spot reserved successfully at {lot.name}</p>
          </div>

          <div className="p-8">
            <div className="flex flex-col md:flex-row gap-8 items-center mb-8">
              {/* QR Code */}
              <div className="flex-shrink-0">
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 shadow-sm">
                  <div className="w-40 h-40 bg-slate-900 rounded-md flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10" />
                    <svg width="100" height="100" viewBox="0 0 120 120" fill="white">
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
                  <p className="text-center text-[10px] font-bold mt-2 text-slate-500 tracking-[0.2em] uppercase">Scan at entry gate</p>
                </div>
              </div>

              {/* Key Details */}
              <div className="flex-1 w-full space-y-4">
                <div className="bg-slate-50 rounded-lg p-4 text-center border border-slate-100">
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Booking Reference</p>
                  <p className="text-3xl font-mono font-bold tracking-widest text-slate-900">{displayBookingId}</p>
                </div>

                <div className="flex justify-center">
                  <StatusBadge status={badgeStatus} />
                </div>
              </div>
            </div>

            {/* Detailed Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 bg-slate-50 p-6 rounded-lg border border-slate-100 text-left">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-blue-50 rounded-md border border-blue-100">
                  <MapPin className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Facility</p>
                  <p className="font-semibold text-slate-900 line-clamp-1" title={lot.name}>{lot.name}</p>
                  <p className="text-xs text-slate-500">Nairobi, Kenya</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-blue-50 rounded-md border border-blue-100">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Schedule</p>
                  <p className="font-semibold text-slate-900">{bookingDetails.date}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-blue-50 rounded-md border border-blue-100">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Time Window</p>
                  <p className="font-semibold text-slate-900">{bookingDetails.startTime} - {bookingDetails.endTime}</p>
                  <p className="text-xs text-slate-500">{bookingDetails.duration.toFixed(1)} Hours booked</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-blue-50 rounded-md border border-blue-100">
                  <Car className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Vehicle</p>
                  <p className="font-semibold text-slate-900">{bookingDetails.plate}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col md:flex-row gap-4">
              <Button
                onClick={() => navigate('/map-results')}
                className="flex-1 h-12 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-blue-600/10 shadow-lg"
              >
                Return to Map
              </Button>

              <Button
                variant="outline"
                className="flex-1 h-12 rounded-md border border-slate-200 hover:bg-slate-50 flex items-center justify-center gap-2 text-slate-600 font-semibold"
              >
                <Download className="w-4 h-4" />
                Print Receipt
              </Button>

              <Button
                variant="outline"
                className="h-12 w-12 rounded-md border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-600"
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
