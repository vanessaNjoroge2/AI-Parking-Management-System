import { apiFetch } from './apiClient';
import type { BookingRecord } from './bookings';

export interface OwnerBookingRecord extends BookingRecord {
  user?: {
    id: string;
    fullName: string;
    phone: string;
  } | null;
}

export async function fetchOwnerBookings(date?: string) {
  const suffix = date ? `?date=${encodeURIComponent(date)}` : '';
  return apiFetch<OwnerBookingRecord[]>(`/bookings/owner${suffix}`);
}

export async function fetchOwnerBookingsRange(from: string, to: string) {
  const dates: string[] = [];
  const start = new Date(from);
  const end = new Date(to);

  for (const day = new Date(start); day <= end; day.setDate(day.getDate() + 1)) {
    dates.push(day.toISOString().slice(0, 10));
  }

  const results = await Promise.all(dates.map((date) => fetchOwnerBookings(date)));
  const deduped = new Map<string, OwnerBookingRecord>();

  results.flat().forEach((booking) => {
    deduped.set(booking.id, booking);
  });

  return Array.from(deduped.values()).sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
  );
}

export async function findOwnerBookingByCode(code: string, from?: string, to?: string) {
  const normalized = code.trim().toUpperCase();
  const matchId = normalized.startsWith('PKS-') ? normalized.slice(4).toLowerCase() : normalized.toLowerCase();
  const bookings = from && to
    ? await fetchOwnerBookingsRange(from, to)
    : await fetchOwnerBookings();

  return bookings.find((booking) => booking.id.slice(0, 8).toLowerCase() === matchId);
}

export async function checkInOwnerBooking(id: string) {
  return apiFetch<OwnerBookingRecord>(`/bookings/${id}/check-in`, {
    method: 'PATCH',
  });
}

export async function checkOutOwnerBooking(id: string) {
  return apiFetch<OwnerBookingRecord>(`/bookings/${id}/check-out`, {
    method: 'PATCH',
  });
}