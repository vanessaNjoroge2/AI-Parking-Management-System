import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../service/database.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class AuthRepository {
  constructor(private readonly db: DatabaseService) {}

  findByPhone(phone: string) {
    return this.db.user.findUnique({ where: { phone } });
  }

  findByEmail(email: string) {
    return this.db.user.findUnique({ where: { email } });
  }

  createUser(data: {
    fullName: string;
    phone: string;
    email?: string | null;
    password: string;
    role?: UserRole;
  }) {
    return this.db.user.create({ data });
  }

  async updateLastLogin(userId: string, date: Date) {
    return this.db.user.update({
      where: { id: userId },
      data: { lastLoginAt: date },
    });
  }
}
