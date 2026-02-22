import { apiFetch } from './apiClient';

export type PricingType = 'HOURLY' | 'DAILY' | 'FLAT';

export interface PricingRule {
  id: string;
  type: PricingType;
  amount: number;
  currency: string;
  isActive: boolean;
}

export interface ParkingPhoto {
  id: string;
  url: string;
  isPrimary: boolean;
}

export interface WorkingHour {
  id: string;
  dayOfWeek: number;
  opensAt: string;
  closesAt: string;
  isClosed: boolean;
}

export interface ParkingLot {
  id: string;
  name: string;
  description?: string | null;
  addressText?: string | null;
  latitude: number | string;
  longitude: number | string;
  capacityTotal: number;
  isActive: boolean;
  isCovered?: boolean | null;
  isGuarded?: boolean | null;
  wheelchairFriendly?: boolean | null;
  hasCctv?: boolean | null;
  hasLighting?: boolean | null;
  pricingRules?: PricingRule[];
  workingHours?: WorkingHour[];
  photos?: ParkingPhoto[];
}

export interface NormalizedParkingLot extends ParkingLot {
  lat: number;
  lng: number;
}

export function normalizeParkingLot(lot: ParkingLot): NormalizedParkingLot {
  return {
    ...lot,
    lat: Number(lot.latitude),
    lng: Number(lot.longitude),
  };
}

export function getPrimaryPricing(lot: ParkingLot) {
  const pricing = lot.pricingRules?.[0];
  if (!pricing) {
    return { amount: 0, currency: 'KES', type: 'FLAT' as PricingType, isFree: true };
  }
  const amount = Number(pricing.amount);
  return {
    amount: Number.isFinite(amount) ? amount : 0,
    currency: pricing.currency ?? 'KES',
    type: pricing.type,
    isFree: amount <= 0,
  };
}

export async function searchParkingLots(lat: number, lng: number, radiusKm: number) {
  return apiFetch<ParkingLot[]>(
    `/parking-lots/search?lat=${lat}&lng=${lng}&radiusKm=${radiusKm}`,
  );
}

export async function getParkingLotDetails(id: string) {
  return apiFetch<ParkingLot>(`/parking-lots/${id}`);
}
