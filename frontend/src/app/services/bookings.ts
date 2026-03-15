import { apiFetch } from './apiClient';

export type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'CANCELLED'
  | 'CHECKED_IN'
  | 'COMPLETED'
  | 'REFUNDED'
  | 'EXPIRED';

export interface BookingParkingLot {
  id: string;
  name: string;
  addressText?: string | null;
}

export interface BookingPayment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  method: string;
  reference?: string;
}

export interface BookingRecord {
  id: string;
  parkingLotId: string;
  userId: string;
  startTime: string;
  endTime: string;
  vehiclePlate?: string | null;
  numberOfCars: number;
  status: BookingStatus;
  createdAt: string;
  parkingLot?: BookingParkingLot | null;
  payment?: BookingPayment | null;
}

export interface BookingPricingSummary {
  parkingLotId: string;
  parkingLotName: string;
  pricingType: 'HOURLY' | 'DAILY' | 'FLAT';
  unitAmount: number;
  currency: string;
  units: number;
  totalAmount: number;
  startTime: string;
  endTime: string;
}

export interface CreateBookingResponse {
  booking: BookingRecord;
  pricing: BookingPricingSummary;
}

export interface CreateBookingPayload {
  parkingLotId: string;
  startTime: string;
  endTime: string;
  vehiclePlate?: string;
  preference?: string;
  numberOfCars?: number;
}

export async function fetchMyBookings() {
  return apiFetch<BookingRecord[]>('/bookings/my');
}

export async function fetchMyBookingById(id: string) {
  return apiFetch<BookingRecord>(`/bookings/my/${id}`);
}

export async function createBooking(payload: CreateBookingPayload) {
  return apiFetch<CreateBookingResponse>('/bookings', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function cancelMyBooking(id: string) {
  return apiFetch<BookingRecord>(`/bookings/my/${id}/cancel`, {
    method: 'PATCH',
  });
}
