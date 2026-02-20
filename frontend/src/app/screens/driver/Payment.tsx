import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { ArrowLeft, Smartphone, CreditCard, Wallet } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { ParkingLot } from '../../services/overpass';

interface BookingDetails {
  date: string;
  startTime: string;
  endTime: string;
  plate: string;
  duration: number;
  totalCost: number;
}

export function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  const { lot, bookingDetails } = (location.state as { lot: ParkingLot; bookingDetails: BookingDetails }) || {};

  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'card' | 'wallet'>('mpesa');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Redirect if missing data
  if (!lot || !bookingDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <p className="text-muted-foreground">No booking details found.</p>
        <Button onClick={() => navigate('/map-results')}>Go to Map</Button>
      </div>
    );
  }

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    setTimeout(() => {
      navigate('/booking-confirmation', {
        state: {
          lot,
          bookingDetails,
          paymentMethod
        }
      });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 flex justify-center">
      <div className="max-w-6xl w-full">
        <form onSubmit={handlePayment} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Payment Methods */}
          <div className="lg:col-span-7 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4 mb-2">
              <button
                type="button"
                onClick={() => navigate('/booking-form', { state: { lot } })}
                className="p-2 hover:bg-secondary rounded-xl transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-primary" />
              </button>
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-primary">Payment</h2>
                <p className="text-muted-foreground">Complete your booking for {lot.name}</p>
              </div>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-border/50">
              <h3 className="text-xl font-semibold mb-6">Select Payment Method</h3>
              <div className="flex flex-col gap-4">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('mpesa')}
                  className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all hover:shadow-md ${paymentMethod === 'mpesa'
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-white'
                    }`}
                >
                  <div className="p-3 bg-accent/10 rounded-xl">
                    <Smartphone className="w-6 h-6 text-accent" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium">M-Pesa</p>
                    <p className="text-sm text-muted-foreground">Pay via mobile money</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 ${paymentMethod === 'mpesa'
                    ? 'border-primary bg-primary'
                    : 'border-muted-foreground'
                    }`}>
                    {paymentMethod === 'mpesa' && (
                      <div className="w-full h-full rounded-full bg-white scale-50" />
                    )}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all hover:shadow-md ${paymentMethod === 'card'
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-white'
                    }`}
                >
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <CreditCard className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium">Credit/Debit Card</p>
                    <p className="text-sm text-muted-foreground">Visa, Mastercard</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 ${paymentMethod === 'card'
                    ? 'border-primary bg-primary'
                    : 'border-muted-foreground'
                    }`}>
                    {paymentMethod === 'card' && (
                      <div className="w-full h-full rounded-full bg-white scale-50" />
                    )}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('wallet')}
                  className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all hover:shadow-md ${paymentMethod === 'wallet'
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-white'
                    }`}
                >
                  <div className="p-3 bg-accent/10 rounded-xl">
                    <Wallet className="w-6 h-6 text-accent" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium">ParkSmart Wallet</p>
                    <p className="text-sm text-muted-foreground">Balance: KES 1,250.00</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 ${paymentMethod === 'wallet'
                    ? 'border-primary bg-primary'
                    : 'border-muted-foreground'
                    }`}>
                    {paymentMethod === 'wallet' && (
                      <div className="w-full h-full rounded-full bg-white scale-50" />
                    )}
                  </div>
                </button>
              </div>

              {/* M-Pesa Phone Number Input */}
              {paymentMethod === 'mpesa' && (
                <div className="mt-8 animate-in fade-in slide-in-from-top-4 duration-300">
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    M-Pesa Phone Number
                  </label>
                  <div className="relative">
                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-accent" />
                    <Input
                      type="tel"
                      placeholder="07XX XXX XXX"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="pl-12 h-14 bg-white rounded-2xl border border-border"
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                    <Smartphone className="w-3 h-3" />
                    You will receive a payment prompt on your phone
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Payment Summary */}
          <div className="lg:col-span-5 lg:sticky lg:top-8">
            <div className="bg-white rounded-3xl border border-border/50 shadow-sm p-6 md:p-8">
              <h3 className="text-xl font-semibold mb-6">Payment Summary</h3>

              <div className="flex justify-between items-center mb-6 p-4 bg-secondary/30 rounded-2xl">
                <span className="text-lg text-muted-foreground">Amount to Pay</span>
                <span className="text-3xl font-bold text-accent">KES {bookingDetails.totalCost.toFixed(0)}</span>
              </div>

              <div className="space-y-3 text-sm text-muted-foreground mb-8">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>KES {bookingDetails.totalCost.toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (0%)</span>
                  <span>KES 0.00</span>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-14 rounded-2xl bg-accent text-white hover:bg-accent/90 text-lg font-medium shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
                disabled={paymentMethod === 'mpesa' && !phoneNumber}
              >
                {paymentMethod === 'mpesa' ? 'Pay with M-Pesa' : 'Confirm Payment'}
              </Button>

              <p className="text-center text-xs text-muted-foreground mt-4">
                Secure payment powered by Stripe & Safaricom
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
