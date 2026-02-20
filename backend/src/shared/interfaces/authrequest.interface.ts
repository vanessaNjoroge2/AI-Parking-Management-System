import { UserRole } from '@prisma/client';

export interface AuthRequest {
  user: {
    userId: string;
    role: UserRole;
  };
}
