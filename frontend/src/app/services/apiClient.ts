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

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAccessToken();
  const headers = new Headers(options.headers ?? {});

  if (!headers.has('Content-Type')) {
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
