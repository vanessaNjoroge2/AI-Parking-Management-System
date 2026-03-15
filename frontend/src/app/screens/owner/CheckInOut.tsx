import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { ArrowLeft, QrCode, CheckCircle, XCircle, Clock, Car, Search } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { StatusBadge } from '../../components/StatusBadge';
import {
  checkInOwnerBooking,
  checkOutOwnerBooking,
  findOwnerBookingByCode,
  type OwnerBookingRecord,
} from '../../services/ownerBookings';
import { format } from 'date-fns';
import { Input } from '../../components/ui/input';

export function CheckInOut() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = (location.state as {
    booking?: OwnerBookingRecord;
    lookupRange?: { from: string; to: string };
    persistedFilters?: {
      dateFrom?: string;
      dateTo?: string;
      statusFilter?: 'all' | 'confirmed' | 'pending' | 'cancelled';
      lotFilter?: string;
      searchQuery?: string;
    };
  } | undefined);
  const [scanned, setScanned] = useState(false);
  const [booking, setBooking] = useState<OwnerBookingRecord | undefined>(
    locationState?.booking,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [lookupCode, setLookupCode] = useState('');
  const [isLookingUp, setIsLookingUp] = useState(false);
  const lookupRange = locationState?.lookupRange;

  const formattedCode = useMemo(
    () => (booking ? `PKS-${booking.id.slice(0, 8).toUpperCase()}` : ''),
    [booking],
  );

  const statusBadge = useMemo(() => {
    switch (booking?.status) {
      case 'CONFIRMED':
      case 'CHECKED_IN':
      case 'COMPLETED':
        return 'confirmed' as const;
      case 'CANCELLED':
      case 'REFUNDED':
      case 'EXPIRED':
        return 'cancelled' as const;
      default:
        return 'pending' as const;
    }
  }, [booking?.status]);

  const handleAction = async () => {
    if (!booking) return;
    setIsSubmitting(true);
    setError('');
    try {
      const updated =
        booking.status === 'CHECKED_IN'
          ? await checkOutOwnerBooking(booking.id)
          : await checkInOwnerBooking(booking.id);
      setBooking(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update booking status');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLookup = async () => {
    if (!lookupCode.trim()) {
      setError('Enter a booking code or scanned QR text.');
      return;
    }

    setIsLookingUp(true);
    setError('');
    try {
      const result = await findOwnerBookingByCode(
        lookupCode,
        lookupRange?.from,
        lookupRange?.to,
      );
      if (!result) {
        setError('No booking found for that code.');
        return;
      }

      setBooking(result);
      setScanned(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to find booking');
    } finally {
      setIsLookingUp(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col max-w-[390px] mx-auto bg-background">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-6 shadow-xl">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/owner/todays-bookings', {
              state: { filters: locationState?.persistedFilters },
            })}
            className="p-2.5 bg-slate-800 rounded-md border border-slate-700 hover:bg-slate-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </button>
          <div className="text-left">
            <h2 className="text-xl font-semibold text-white tracking-tight">Check-in and access</h2>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Booking verification</p>
          </div>
        </div>
      </div>

      <div className="flex-1 px-6 py-6 flex flex-col">
        <div className="mb-6 space-y-3">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Booking code / QR text</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                value={lookupCode}
                onChange={(e) => setLookupCode(e.target.value.toUpperCase())}
                placeholder="PKS-1234ABCD"
                className="pl-10"
              />
            </div>
            <Button type="button" onClick={handleLookup} disabled={isLookingUp}>
              {isLookingUp ? 'Finding...' : 'Find'}
            </Button>
          </div>
          {error && !scanned && (
            <p className="text-sm text-red-600">{error}</p>
          )}
        </div>

        {/* QR Scanner */}
        {!scanned ? (
          <div className="mb-6">
            <button
              onClick={handleLookup}
              className="w-full aspect-square bg-slate-900 border border-slate-800 rounded-lg flex flex-col items-center justify-center gap-6 hover:border-blue-500/50 group transition-all relative overflow-hidden active:scale-[0.98]"
            >
              <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="p-8 bg-blue-600/10 rounded-full border border-blue-500/20 group-hover:scale-110 transition-transform">
                <QrCode className="w-16 h-16 text-blue-500" />
              </div>
              <div className="text-center relative z-10">
                <p className="text-lg font-semibold text-white mb-1">Verify booking</p>
                <p className="text-xs text-slate-500 font-medium">
                  {lookupRange
                    ? `Lookup will search ${lookupRange.from} to ${lookupRange.to}`
                    : 'Paste scanned QR text or booking code to continue'}
                </p>
              </div>
            </button>
          </div>
        ) : (
          <div className="mb-6">
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-6 text-center animate-in zoom-in-95 duration-300">
              <CheckCircle className="w-12 h-12 text-blue-600 mx-auto mb-3" />
              <p className="text-lg font-semibold text-slate-900 mb-1">Booking verified</p>
              <p className="text-xs text-slate-500 font-medium font-mono uppercase tracking-tighter">Access can be approved for this booking</p>
            </div>
          </div>
        )}

        {/* Booking Details */}
        {scanned && booking && (
          <div className="bg-white rounded-lg p-6 mb-6 shadow-sm border border-slate-200 text-left animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-900">Booking details</h3>
              <StatusBadge status={statusBadge} />
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-slate-50 border border-slate-100 rounded-md">
                  <QrCode className="w-4 h-4 text-slate-400" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Reference</p>
                  <p className="text-base font-mono font-bold text-slate-900">{formattedCode}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-slate-50 border border-slate-100 rounded-md">
                    <Car className="w-4 h-4 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Asset</p>
                    <p className="text-sm font-semibold text-slate-900">{booking.vehiclePlate ?? 'Not provided'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-slate-50 border border-slate-100 rounded-md">
                    <Clock className="w-4 h-4 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Window</p>
                    <p className="text-xs font-semibold text-slate-900 leading-tight">{format(new Date(booking.startTime), 'hh:mm a')} - {format(new Date(booking.endTime), 'hh:mm a')}</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Transaction</span>
                  <span className="text-2xl font-bold text-blue-600">KES {booking.payment?.amount ?? 0}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Customer</p>
                <p className="text-sm font-semibold text-slate-900">{booking.user?.fullName ?? 'Unknown customer'}</p>
                <p className="text-xs text-slate-500">{booking.user?.phone ?? ''}</p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-md text-sm text-red-600">
                  {error}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Action Buttons */}
        {scanned && booking && (
          <div className="space-y-4 mt-auto">
            <Button
              onClick={handleAction}
              className="w-full h-14 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 font-semibold shadow-lg shadow-blue-600/10"
              disabled={isSubmitting || booking.status === 'COMPLETED' || booking.status === 'CANCELLED'}
            >
              <CheckCircle className="w-5 h-5" />
              {booking.status === 'CHECKED_IN'
                ? isSubmitting
                  ? 'Checking Out...'
                  : 'Complete Checkout'
                : isSubmitting
                ? 'Checking In...'
                : 'Authorize Access'}
            </Button>

            <Button
              variant="outline"
              onClick={() => setScanned(false)}
              className="w-full h-12 rounded-md border border-slate-200 text-slate-500 flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors font-medium"
            >
              <XCircle className="w-4 h-4 text-slate-300" />
              Clear lookup
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
