import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, QrCode, CheckCircle, XCircle, MapPin, Calendar, Clock, Car } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { StatusBadge } from '../../components/StatusBadge';

export function CheckInOut() {
  const navigate = useNavigate();
  const [scanned, setScanned] = useState(false);

  const booking = {
    code: 'PKS-2026-4872',
    vehicle: 'ABC-1234',
    location: 'Downtown Plaza Parking',
    date: 'February 20, 2026',
    time: '09:00 AM - 05:00 PM',
    status: 'confirmed' as const,
    amount: 64,
    customer: 'Jane Smith',
  };

  return (
    <div className="min-h-screen flex flex-col max-w-[390px] mx-auto bg-background">
      {/* Header */}
      <div className="bg-white px-6 py-6 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/owner/todays-bookings')}
            className="p-2 hover:bg-secondary rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-primary" />
          </button>
          <h2 className="text-2xl">Check In/Out</h2>
        </div>
      </div>

      <div className="flex-1 px-6 py-6 flex flex-col">
        {/* QR Scanner */}
        {!scanned ? (
          <div className="mb-6">
            <button
              onClick={() => setScanned(true)}
              className="w-full aspect-square bg-gradient-to-br from-primary to-accent rounded-3xl flex flex-col items-center justify-center gap-4 hover:opacity-90 transition-opacity"
            >
              <QrCode className="w-24 h-24 text-white" />
              <div className="text-white text-center">
                <p className="text-lg mb-1">Tap to Scan QR Code</p>
                <p className="text-sm text-white/80">Scan customer's booking code</p>
              </div>
            </button>
          </div>
        ) : (
          <div className="mb-6">
            <div className="bg-accent/10 rounded-2xl p-6 text-center">
              <CheckCircle className="w-16 h-16 text-accent mx-auto mb-3" />
              <p className="text-lg mb-1">QR Code Scanned</p>
              <p className="text-sm text-muted-foreground">Booking verified successfully</p>
            </div>
          </div>
        )}

        {/* Booking Details */}
        {scanned && (
          <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg">Booking Details</h3>
              <StatusBadge status={booking.status} />
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Booking Code</p>
                <p className="text-lg font-medium tracking-wide">{booking.code}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Customer</p>
                <p>{booking.customer}</p>
              </div>

              <div className="flex items-center gap-3">
                <Car className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Vehicle</p>
                  <p className="font-medium">{booking.vehicle}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p>{booking.location}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p>{booking.date}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Time</p>
                  <p>{booking.time}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="text-2xl text-accent">${booking.amount}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Action Buttons */}
        {scanned && (
          <div className="space-y-3">
            <Button
              onClick={() => {
                navigate('/owner/todays-bookings');
              }}
              className="w-full h-14 rounded-2xl bg-accent text-white flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              Confirm Check-In
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setScanned(false)}
              className="w-full h-14 rounded-2xl border-2 border-destructive text-destructive flex items-center justify-center gap-2 hover:bg-destructive/5"
            >
              <XCircle className="w-5 h-5" />
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
