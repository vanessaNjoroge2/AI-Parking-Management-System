import { apiFetch } from './apiClient';

export type PaymentStatus = 'INITIATED' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
export type PaymentMethod = 'MPESA' | 'CARD';

export interface SimulatedPaymentResult {
  reference: string;
  amount: number;
  methodLabel: 'Card' | 'Wallet';
  status: PaymentStatus;
}

export interface PaymentRecord {
  id: string;
  bookingId: string;
  method: PaymentMethod;
  amount: number;
  currency: string;
  status: PaymentStatus;
  phone?: string | null;
  reference: string;
  providerRef?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StkPushResponse {
  message: string;
  reference: string;
  paymentId: string;
  providerResponse: unknown;
}

export async function initiateMpesaPayment(payload: {
  bookingId: string;
  phone: string;
}) {
  return apiFetch<StkPushResponse>('/payments/stk-push', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function fetchPaymentStatusByReference(reference: string) {
  return apiFetch<PaymentRecord>(`/payments/reference/${reference}/status`);
}

export async function simulateFrontendPayment(payload: {
  amount: number;
  method: 'card' | 'wallet';
}) {
  await new Promise((resolve) => setTimeout(resolve, 1200));

  return {
    reference: `${payload.method.toUpperCase()}-${Date.now()}`,
    amount: payload.amount,
    methodLabel: payload.method === 'card' ? 'Card' : 'Wallet',
    status: 'SUCCESS' as const,
  } satisfies SimulatedPaymentResult;
}