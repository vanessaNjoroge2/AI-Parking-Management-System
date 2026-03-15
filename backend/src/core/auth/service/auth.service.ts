import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { AuthRepository } from '../../../shared/database/repository/auth/auth.repository';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly repo: AuthRepository,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const normalizedPhone = this.normalizeKenyanPhone(dto.phone);

    // Check phone
    const existingPhone = await this.repo.findByPhone(normalizedPhone);
    if (existingPhone) throw new ConflictException('Phone already in use');

    // Check email if provided
    if (dto.email) {
      const existingEmail = await this.repo.findByEmail(dto.email);
      if (existingEmail) throw new ConflictException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.repo.createUser({
      fullName: dto.fullName,
      phone: normalizedPhone,
      email: dto.email ?? null,
      password: hashedPassword,
      role: dto.role, // default handled by Prisma if needed
    });

    return {
      user: { id: user.id, role: user.role },
      accessToken: this.signToken(user.id, user.role),
    };
  }

  async login(dto: LoginDto) {
    const identifier = dto.identifier.trim();
    const user = this.isEmail(identifier)
      ? await this.repo.findByEmail(identifier.toLowerCase())
      : await this.repo.findByPhone(this.normalizeKenyanPhone(identifier));

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const passwordValid = await bcrypt.compare(dto.password, user.password);
    if (!passwordValid) throw new UnauthorizedException('Invalid credentials');

    // Update last login timestamp
    await this.repo.updateLastLogin(user.id, new Date());

    return {
      user: { id: user.id, role: user.role },
      accessToken: this.signToken(user.id, user.role),
    };
  }

  private signToken(userId: string, role: string) {
    return this.jwt.sign(
      { sub: userId, role },
      { expiresIn: '1h' }, // token expiration
    );
  }

  private normalizeKenyanPhone(phone: string) {
    const normalized = phone.replace(/\s+/g, '');

    if (normalized.startsWith('+254')) {
      return `0${normalized.slice(4)}`;
    }

    if (normalized.startsWith('254')) {
      return `0${normalized.slice(3)}`;
    }

    return normalized;
  }

  private isEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }
}
