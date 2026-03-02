import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PaymentMethod, PaymentStatus } from '@prisma/client';
import { PaymentsRepository } from '../../../shared/database/repository/payments/payments.repository';

@Injectable()
export class PaymentsService {
  constructor(private readonly repo: PaymentsRepository) {}

  // DRIVER initiates payment for their own booking
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

    // MVP amount: can be fixed or derived later from pricing rules
    const amount = 200;
    //     Calculate based on:
    // duration
    // parking lot price per hour
    // numberOfCars

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

    // only booking owner (driver) can simulate in dev
    if (payment.booking.userId !== user.userId)
      throw new ForbiddenException('Not your payment');

    if (payment.status !== PaymentStatus.INITIATED) {
      throw new BadRequestException('Payment is not in INITIATED state');
    }

    return this.repo.markSuccess(paymentId);
  }

  async simulateFail(user: { userId: string }, paymentId: string) {
    const payment = await this.repo.findPayment(paymentId);
    if (!payment) throw new NotFoundException('Payment not found');
    if (payment.booking.userId !== user.userId)
      throw new ForbiddenException('Not your payment');

    if (payment.status !== PaymentStatus.INITIATED) {
      throw new BadRequestException('Payment is not in INITIATED state');
    }

    return this.repo.markFailed(paymentId);
  }
}
