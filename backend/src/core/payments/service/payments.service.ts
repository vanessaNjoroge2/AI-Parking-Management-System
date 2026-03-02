import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import {
  UserRole,
  BookingStatus,
  PaymentStatus,
  PaymentMethod,
} from '@prisma/client';
import { PaymentsRepository } from '../../../shared/database/repository/payments/payments.repository';

@Injectable()
export class PaymentsService {
  constructor(private readonly repo: PaymentsRepository) {}

  async initiate(
    user: { userId: string },
    dto: { bookingId: string; method: PaymentMethod; phone?: string },
  ) {
    const booking = await this.repo.findBooking(dto.bookingId);
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.userId !== user.userId)
      throw new ForbiddenException('Not your booking');
    if (booking.payment)
      throw new BadRequestException('Payment already exists for this booking');

    const amount = 200; // TODO: Replace fixed amount with dynamic calculation - booking.duration * parkingLot.pricePerHour
    return this.repo.createPayment({
      bookingId: dto.bookingId,
      method: dto.method,
      amount,
      phone: dto.phone,
    });
  }

  async simulateSuccess(user: { userId: string }, paymentId: string) {
    const payment = await this.repo.findPayment(paymentId);
    if (!payment) throw new NotFoundException('Payment not found');

    if (!payment.booking)
      throw new BadRequestException('Payment has no booking');

    if (payment.booking.userId !== user.userId)
      throw new ForbiddenException('Not your payment');
    if (payment.status !== PaymentStatus.INITIATED)
      throw new BadRequestException('Payment is not in INITIATED state');

    const bookingStatus = payment.booking.status;
    if (
      bookingStatus === BookingStatus.CANCELLED ||
      bookingStatus === BookingStatus.EXPIRED
    ) {
      throw new BadRequestException(
        `Cannot pay for a ${bookingStatus} booking`,
      );
    }

    return this.repo.markSuccess(paymentId);
  }

  async simulateFail(user: { userId: string }, paymentId: string) {
    const payment = await this.repo.findPayment(paymentId);
    if (!payment) throw new NotFoundException('Payment not found');

    if (!payment.booking)
      throw new BadRequestException('Payment has no booking');

    if (payment.booking.userId !== user.userId)
      throw new ForbiddenException('Not your payment');

    if (payment.status !== PaymentStatus.INITIATED)
      throw new BadRequestException('Payment is not in INITIATED state');

    return this.repo.markFailed(paymentId);
  }

  /** Get single payment with proper role scoping */
  async getOne(user: { userId: string; role: UserRole }, id: string) {
    const payment = await this.repo.getPaymentById(id);
    if (!payment) throw new NotFoundException('Payment not found');

    if (!payment.booking)
      throw new BadRequestException('Payment has no booking');

    // Admin can see all
    if (user.role === UserRole.ADMIN) return payment;

    // Booking owner (driver)
    if (payment.booking.userId === user.userId) return payment;

    // Parking lot owner
    if (
      user.role === UserRole.OWNER &&
      payment.booking.parkingLot?.ownerId === user.userId
    ) {
      return payment;
    }

    throw new ForbiddenException('Not allowed to view this payment');
  }

  /** List payments with filters and role scoping */
  async list(
    user: { userId: string; role: UserRole },
    q: {
      status?: PaymentStatus;
      method?: PaymentMethod;
      bookingId?: string;
      from?: string;
      to?: string;
      limit?: string;
      offset?: string;
    },
  ) {
    const take = Math.min(Number(q.limit ?? 50), 200);
    const skip = Number(q.offset ?? 0);

    const where: any = {};
    if (q.status) where.status = q.status;
    if (q.method) where.method = q.method;
    if (q.bookingId) where.bookingId = q.bookingId;

    if (q.from || q.to) {
      where.createdAt = {};
      if (q.from) where.createdAt.gte = new Date(q.from);
      if (q.to) where.createdAt.lte = new Date(q.to);
    }

    // Role scoping
    if (user.role === UserRole.OWNER) {
      where.booking = { parkingLot: { ownerId: user.userId } };
    } else if (user.role === UserRole.DRIVER) {
      where.booking = { userId: user.userId };
    }

    return this.repo.listPayments(where, take, skip);
  }
}
