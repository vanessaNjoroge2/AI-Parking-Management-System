import { getAccessToken } from './authStorage';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

interface ApiErrorPayload {
  message?: string | string[];
  error?: string;
  statusCode?: number;
}

function normalizeErrorMessage(payload?: ApiErrorPayload | null, fallback = 'Request failed') {
  if (!payload) return fallback;
  if (Array.isArray(payload.message)) return payload.message.join(', ');
  return payload.message ?? payload.error ?? fallback;
}

export async function downloadOwnerReport(params?: {
  from?: string;
  to?: string;
  parkingLotId?: string;
}) {
  const token = getAccessToken();

  const query = new URLSearchParams();

  if (params?.from) query.append('from', params.from);
  if (params?.to) query.append('to', params.to);
  if (params?.parkingLotId) query.append('parkingLotId', params.parkingLotId);

  const response = await fetch(
    `${API_BASE_URL}/owner/analytics/report?${query.toString()}`,
    {
      method: 'GET',
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    },
  );

  if (!response.ok) {
    throw new Error('Failed to download report');
  }

  const blob = await response.blob();

  const contentDisposition = response.headers.get('content-disposition');

  let fileName = 'parksmart-owner-report.pdf';

  if (contentDisposition) {
    const match = contentDisposition.match(/filename="(.+)"/);
    if (match?.[1]) {
      fileName = match[1];
    }
  }

  const url = window.URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;

  document.body.appendChild(link);
  link.click();
  link.remove();

  window.URL.revokeObjectURL(url);
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAccessToken();
  const headers = new Headers(options.headers ?? {});

  if (options.method !== 'GET' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type') ?? '';
  const isJson = contentType.includes('application/json');
  const payload = isJson ? await response.json().catch(() => null) : null;

  if (!response.ok) {
    throw new Error(normalizeErrorMessage(payload, response.statusText));
  }

  return payload as T;
}

export function getApiBaseUrl() {
  return API_BASE_URL;
}



