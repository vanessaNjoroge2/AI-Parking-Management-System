export type UserRole = 'DRIVER' | 'OWNER' | 'ADMIN';

export interface AuthUser {
  id: string;
  role: UserRole;
  fullName: string;
  phone: string;
  email?: string;
}


export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
}

export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  phone: string;
  password: string;
  email?: string;
  role?: UserRole;
}
