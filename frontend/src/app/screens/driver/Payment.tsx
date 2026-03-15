import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { ArrowLeft, Smartphone, CreditCard, Wallet } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { NormalizedParkingLot } from "../../services/parkingLots";
import { createBooking } from "../../services/bookings";
import {
  fetchPaymentStatusByReference,
  initiateMpesaPayment,
  simulateFrontendPayment,
} from "../../services/payments";

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
  const { lot, bookingDetails } =
    (location.state as {
      lot: NormalizedParkingLot;
      bookingDetails: BookingDetails;
    }) || {};

  const [paymentMethod, setPaymentMethod] = useState<
    "mpesa" | "card" | "wallet"
  >("mpesa");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [paymentReference, setPaymentReference] = useState("");
  const [paymentMessage, setPaymentMessage] = useState("");

  const paymentMethodLabel =
    paymentMethod === "mpesa"
      ? "M-Pesa"
      : paymentMethod === "card"
        ? "Card"
        : "Wallet";

  // Redirect if missing data
  if (!lot || !bookingDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <p className="text-muted-foreground">No booking details found.</p>
        <Button onClick={() => navigate("/map-results")}>Go to Map</Button>
      </div>
    );
  }

  const toIsoDateTime = (date: string, time: string) => {
    const [year, month, day] = date.split("-").map(Number);
    const [hour, minute] = time.split(":").map(Number);
    const value = new Date(
      year,
      (month ?? 1) - 1,
      day ?? 1,
      hour ?? 0,
      minute ?? 0,
    );
    return value.toISOString();
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setPaymentMessage("");

    try {
      const bookingResponse = await createBooking({
        parkingLotId: lot.id,
        startTime: toIsoDateTime(bookingDetails.date, bookingDetails.startTime),
        endTime: toIsoDateTime(bookingDetails.date, bookingDetails.endTime),
        vehiclePlate: bookingDetails.plate,
        numberOfCars: 1,
      });

      const booking = bookingResponse.booking;

      if (!booking?.id) {
        throw new Error("Unable to create booking. Please try again.");
      }

      if (paymentMethod !== "mpesa") {
        const simulatedPayment = await simulateFrontendPayment({
          amount: bookingDetails.totalCost,
          method: paymentMethod,
        });

        setPaymentReference(simulatedPayment.reference);
        setPaymentMessage(
          `${simulatedPayment.methodLabel} payment approved successfully.`,
        );

        navigate("/booking-confirmation", {
          state: {
            lot,
            bookingDetails,
            bookingId: booking.id,
            bookingStatus: booking.status,
            paymentMethod,
            paymentReference: simulatedPayment.reference,
            paymentAmount: simulatedPayment.amount,
            paymentMethodLabel: simulatedPayment.methodLabel,
            isSimulatedPayment: true,
          },
        });
        return;
      }

      const payment = await initiateMpesaPayment({
        bookingId: booking.id,
        phone: phoneNumber,
      });

      setPaymentReference(payment.reference);
      setPaymentMessage(
        "Payment prompt sent to your phone. Waiting for confirmation...",
      );

      let attempts = 0;
      let latestStatus = "INITIATED";
      let latestPayment: Awaited<
        ReturnType<typeof fetchPaymentStatusByReference>
      > | null = null;

      while (attempts < 24 && latestStatus === "INITIATED") {
        await new Promise((resolve) => setTimeout(resolve, 2500));
        latestPayment = await fetchPaymentStatusByReference(payment.reference);
        latestStatus = latestPayment.status;
        console.log("POLLING PAYMENT STATUS:", {
          reference: payment.reference,
          attempt: attempts + 1,
          status: latestStatus,
          payment: latestPayment,
        });
        attempts += 1;
      }

      if (!latestPayment) {
        throw new Error(
          "Unable to verify payment status. Please check your booking history.",
        );
      }

      if (latestPayment.status !== "SUCCESS") {
        throw new Error(
          latestPayment.status === "FAILED"
            ? "Payment failed. Please try again."
            : "Payment is still pending. Please check your phone and booking history.",
        );
      }

      navigate("/booking-confirmation", {
        state: {
          lot,
          bookingDetails,
          bookingId: booking.id,
          bookingStatus: "CONFIRMED",
          paymentMethod,
          paymentReference: payment.reference,
          paymentAmount: latestPayment.amount,
          paymentMethodLabel,
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 flex justify-center">
      <div className="max-w-6xl w-full">
        <form
          onSubmit={handlePayment}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
        >
          {/* Left Column: Payment Methods */}
          <div className="lg:col-span-7 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4 mb-2">
              <button
                type="button"
                onClick={() => navigate("/booking-form", { state: { lot } })}
                className="p-2 hover:bg-slate-100 rounded-md transition-colors border border-slate-200"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </button>
              <div className="text-left">
                <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
                  Secure Payment
                </h2>
                <p className="text-slate-500">
                  Processing booking for {lot.name}
                </p>
              </div>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm border border-slate-200 text-left">
              <h3 className="text-xl font-semibold mb-6 text-slate-900 border-b border-slate-100 pb-2">
                Select Payment Method
              </h3>
              <div className="flex flex-col gap-4">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("mpesa")}
                  className={`flex items-center gap-4 p-4 rounded-md border-2 transition-all ${
                    paymentMethod === "mpesa"
                      ? "border-blue-600 bg-blue-50/50"
                      : "border-slate-100 bg-white hover:border-slate-200"
                  }`}
                >
                  <div className="p-3 bg-emerald-50 rounded-md border border-emerald-100">
                    <Smartphone className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-slate-900">
                      M-Pesa Express
                    </p>
                    <p className="text-xs text-slate-500">
                      Direct mobile STK push
                    </p>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 ${
                      paymentMethod === "mpesa"
                        ? "border-blue-600 bg-blue-600"
                        : "border-slate-300"
                    }`}
                  >
                    {paymentMethod === "mpesa" && (
                      <div className="w-full h-full rounded-full bg-white scale-50" />
                    )}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`flex items-center gap-4 p-4 rounded-md border-2 transition-all ${
                    paymentMethod === "card"
                      ? "border-blue-600 bg-blue-50/50"
                      : "border-slate-100 bg-white hover:border-slate-200"
                  }`}
                >
                  <div className="p-3 bg-blue-50 rounded-md border border-blue-100">
                    <CreditCard className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-slate-900">
                      Debit / Credit Card
                    </p>
                    <p className="text-xs text-slate-500">
                      Demo success flow enabled
                    </p>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 ${
                      paymentMethod === "card"
                        ? "border-blue-600 bg-blue-600"
                        : "border-slate-300"
                    }`}
                  >
                    {paymentMethod === "card" && (
                      <div className="w-full h-full rounded-full bg-white scale-50" />
                    )}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("wallet")}
                  className={`flex items-center gap-4 p-4 rounded-md border-2 transition-all ${
                    paymentMethod === "wallet"
                      ? "border-blue-600 bg-blue-50/50"
                      : "border-slate-100 bg-white hover:border-slate-200"
                  }`}
                >
                  <div className="p-3 bg-slate-100 rounded-md border border-slate-200">
                    <Wallet className="w-6 h-6 text-slate-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-slate-900">
                      ParkSmart Wallet
                    </p>
                    <p className="text-xs text-slate-500">
                      Demo success flow enabled
                    </p>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 ${
                      paymentMethod === "wallet"
                        ? "border-blue-600 bg-blue-600"
                        : "border-slate-300"
                    }`}
                  >
                    {paymentMethod === "wallet" && (
                      <div className="w-full h-full rounded-full bg-white scale-50" />
                    )}
                  </div>
                </button>
              </div>

              {/* M-Pesa Phone Number Input */}
              {paymentMethod === "mpesa" && (
                <div className="mt-8 animate-in fade-in slide-in-from-top-4 duration-300">
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    M-Pesa Phone Number
                  </label>
                  <div className="relative">
                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      type="tel"
                      placeholder="07XX XXX XXX"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="pl-12 h-12 bg-slate-50 rounded-md border border-slate-200"
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
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 md:p-8">
              <h3 className="text-xl font-semibold mb-6 text-slate-900 border-b border-slate-100 pb-2">
                Payment Summary
              </h3>

              <div className="flex justify-between items-center mb-6 p-4 bg-slate-50 rounded-md border border-slate-100">
                <span className="text-lg text-slate-500">Total Payable</span>
                <span className="text-3xl font-bold text-blue-600">
                  KES {bookingDetails.totalCost.toFixed(0)}
                </span>
              </div>

              <div className="space-y-3 text-sm text-slate-500 mb-8 px-2">
                <div className="flex justify-between">
                  <span>Parking service fee</span>
                  <span className="text-slate-900 font-medium">
                    KES {bookingDetails.totalCost.toFixed(0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Platform Processing (0%)</span>
                  <span className="text-slate-900 font-medium font-mono">
                    KES 0.00
                  </span>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-md mb-6">
                  <p className="text-sm text-red-600 text-center">{error}</p>
                </div>
              )}

              {paymentMessage && (
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-md mb-6">
                  <p className="text-sm text-blue-700 text-center">
                    {paymentMessage}
                  </p>
                  {paymentReference && (
                    <p className="text-[11px] text-blue-500 text-center mt-1 font-mono">
                      Ref: {paymentReference}
                    </p>
                  )}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-14 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold shadow-blue-600/10 shadow-lg transition-all"
                disabled={
                  (paymentMethod === "mpesa" && !phoneNumber) || isSubmitting
                }
              >
                {isSubmitting
                  ? paymentMethod === "mpesa"
                    ? "Verifying Transaction..."
                    : `Processing ${paymentMethodLabel}...`
                  : paymentMethod === "mpesa"
                    ? "Initiate M-Pesa Payment"
                    : `Pay with ${paymentMethodLabel}`}
              </Button>

              <p className="text-center text-xs text-slate-400 mt-4 tracking-tight">
                Payments processed securely via PCI-DSS compliant gateways.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
