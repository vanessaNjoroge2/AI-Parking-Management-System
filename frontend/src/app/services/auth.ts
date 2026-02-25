import { apiFetch } from './apiClient';
import { setStoredAuth } from './authStorage';
import type { AuthResponse, LoginRequest, RegisterRequest } from './authTypes';

export type { AuthResponse, LoginRequest, RegisterRequest, UserRole, AuthUser } from './authTypes';

export async function login(payload: LoginRequest): Promise<AuthResponse> {
  const response = await apiFetch<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  setStoredAuth(response);
  return response;
}

export async function register(payload: RegisterRequest): Promise<AuthResponse> {
  const response = await apiFetch<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  setStoredAuth(response);
  return response;
}
