import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { ArrowLeft, MapPin, Calendar, Clock, Car } from 'lucide-react';
import { StatusBadge } from '../../components/StatusBadge';
import type { BookingRecord } from '../../services/bookings';
import { format } from 'date-fns';
import { Button } from '../../components/ui/button';

export function BookingDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const { booking } = (location.state as { booking?: BookingRecord }) || {};
  const [actionMessage, setActionMessage] = useState('');

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <p className="text-muted-foreground">No booking selected.</p>
        <Button onClick={() => navigate('/booking-history')}>Back to History</Button>
      </div>
    );
  }

  const status = booking.status;
  const badgeStatus =
    status === 'CONFIRMED' || status === 'CHECKED_IN' || status === 'COMPLETED'
      ? 'confirmed'
      : status === 'CANCELLED' || status === 'REFUNDED' || status === 'EXPIRED'
      ? 'cancelled'
      : 'pending';

  const lotName = booking.parkingLot?.name ?? 'Parking Spot';
  const address = booking.parkingLot?.addressText ?? 'Address not available';
  const amount = booking.payment?.amount ?? 0;
  const currency = booking.payment?.currency ?? 'KES';
  const bookingCode = `PKS-${booking.id.slice(0, 8).toUpperCase()}`;

  const handleCancel = () => {
    setActionMessage('Cancel request queued. We’ll notify you once it’s processed.');
  };

  const handleReschedule = () => {
    setActionMessage('Reschedule coming soon. You’ll be able to pick a new time here.');
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 flex justify-center">
      <div className="max-w-3xl w-full">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/booking-history')}
            className="p-2 hover:bg-secondary rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-primary" />
          </button>
          <div>
            <h2 className="text-2xl font-semibold">Booking Details</h2>
            <p className="text-sm text-muted-foreground">Code: {bookingCode}</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-border/50 p-6 md:p-8 space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold mb-2">{lotName}</h3>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{address}</span>
              </div>
            </div>
            <StatusBadge status={badgeStatus} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 bg-secondary/50 rounded-2xl p-4">
              <Calendar className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-medium">
                  {format(new Date(booking.startTime), 'MMM dd, yyyy')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-secondary/50 rounded-2xl p-4">
              <Clock className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Time</p>
                <p className="font-medium">
                  {format(new Date(booking.startTime), 'hh:mm a')} - {format(new Date(booking.endTime), 'hh:mm a')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-secondary/50 rounded-2xl p-4">
              <Car className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Vehicle Plate</p>
                <p className="font-medium">{booking.vehiclePlate ?? 'Not provided'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-secondary/50 rounded-2xl p-4">
              <div>
                <p className="text-sm text-muted-foreground">Amount</p>
                <p className="font-medium">{currency} {amount}</p>
              </div>
            </div>
            <div className="md:col-span-2 space-y-4 pt-2 border-t border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-medium">{status.replace('_', ' ')}</p>
                </div>
                <Button onClick={() => navigate('/map-results')}>
                  Book Again
                </Button>
              </div>

              <div className="flex flex-col justify-center md:flex-row gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="w-1/4"
                  onClick={handleReschedule}
                >
                  Reschedule Booking
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  className="w-1/4"
                  onClick={handleCancel}
                >
                  Cancel Booking
                </Button>
              </div>

              {actionMessage && (
                <div className="text-sm text-muted-foreground bg-secondary/40 rounded-2xl p-4">
                  {actionMessage}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
