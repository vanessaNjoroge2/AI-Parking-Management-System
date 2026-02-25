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

export interface WorkingHourItem {
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

export interface CreateParkingLotPayload {
  name: string;
  description?: string;
  addressText?: string;
  latitude: number;
  longitude: number;
  capacityTotal: number;
  isGuarded?: boolean;
  wheelchairFriendly?: boolean;
  hasCctv?: boolean;
  hasLighting?: boolean;
  isCovered?: boolean;
}

export interface UpdateParkingLotPayload extends Partial<CreateParkingLotPayload> {
  isActive?: boolean;
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

export async function getOwnerParkingLots() {
  return apiFetch<ParkingLot[]>('/parking-lots/owner/mine');
}

export async function createParkingLot(payload: CreateParkingLotPayload) {
  return apiFetch<ParkingLot>('/parking-lots', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateParkingLot(id: string, payload: UpdateParkingLotPayload) {
  return apiFetch<ParkingLot>(`/parking-lots/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function setParkingLotPricing(
  id: string,
  payload: { type: PricingType; amount: number; currency?: string },
) {
  return apiFetch<ParkingLot>(`/parking-lots/${id}/pricing`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function setParkingLotWorkingHours(id: string, items: WorkingHourItem[]) {
  return apiFetch<ParkingLot>(`/parking-lots/${id}/working-hours`, {
    method: 'POST',
    body: JSON.stringify(items),
  });
}
